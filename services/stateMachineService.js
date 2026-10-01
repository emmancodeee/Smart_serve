/**
 * State Machine Service
 * Defines valid states, transitions, guards, and lifecycle hooks for
 * Registration and ReturnRequest entities.
 */
const logger = require('../utils/logger');

/**
 * Create a state machine definition
 * @param {object} config - State machine configuration
 * @param {string} config.entityName - Name of the entity (e.g., 'Registration', 'ReturnRequest')
 * @param {string[]} config.states - All valid states
 * @param {object} config.transitions - Map of { state: { targetState: { guard?: function, onTransition?: function } } }
 * @param {string} config.initialState - Starting state
 */
function createStateMachine(config) {
  const { entityName, states, transitions, initialState } = config;

  if (!states.includes(initialState)) {
    throw new Error(`Initial state '${initialState}' must be one of the defined states for ${entityName}`);
  }

  // Validate transitions reference valid states
  for (const [fromState, toStates] of Object.entries(transitions)) {
    if (!states.includes(fromState)) {
      throw new Error(`Transition source state '${fromState}' is not a valid state for ${entityName}`);
    }
    for (const toState of Object.keys(toStates)) {
      if (!states.includes(toState)) {
        throw new Error(`Transition target state '${toState}' is not a valid state for ${entityName}`);
      }
    }
  }

  return {
    entityName,
    states,
    transitions,
    initialState,

    /**
     * Check if a transition is valid
     * @param {string} from - Current state
     * @param {string} to - Target state
     * @returns {boolean} Whether the transition is valid
     */
    canTransition(from, to) {
      if (!states.includes(from)) return false;
      if (!states.includes(to)) return false;
      const fromTransitions = transitions[from];
      return Boolean(fromTransitions && fromTransitions[to]);
    },

    /**
     * Get all valid next states from a given state
     * @param {string} from - Current state
     * @returns {string[]} Valid next states
     */
    getNextStates(from) {
      if (!states.includes(from)) return [];
      const fromTransitions = transitions[from];
      return fromTransitions ? Object.keys(fromTransitions) : [];
    },

    /**
     * Execute a state transition with guards and lifecycle hooks
     * @param {object} entity - The entity to transition
     * @param {string} toState - Target state
     * @param {object} [context={}] - Additional context for guards/hooks
     * @returns {object} { success: boolean, error?: string, entity?: object }
     */
    async transition(entity, toState, context = {}) {
      const fromState = entity.status || entity.state || initialState;

      if (fromState === toState) {
        return { success: true, entity, unchanged: true };
      }

      if (!this.canTransition(fromState, toState)) {
        const validNext = this.getNextStates(fromState);
        return {
          success: false,
          error: `Cannot transition ${entityName} from '${fromState}' to '${toState}'. Valid next states: ${validNext.join(', ') || 'none'}`
        };
      }

      const transitionDef = transitions[fromState][toState];

      // Execute guard if defined
      if (typeof transitionDef.guard === 'function') {
        const guardResult = await transitionDef.guard(entity, context);
        if (guardResult !== true) {
          return {
            success: false,
            error: typeof guardResult === 'string' ? guardResult : `Guard rejected transition for ${entityName} from '${fromState}' to '${toState}'`
          };
        }
      }

      // Update entity state
      entity.status = toState;

      // Execute onTransition hook if defined
      if (typeof transitionDef.onTransition === 'function') {
        try {
          await transitionDef.onTransition(entity, context);
        } catch (hookError) {
          logger.error(`State machine onTransition hook failed for ${entityName}`, {
            from: fromState,
            to: toState,
            error: hookError.message
          });
          return {
            success: false,
            error: `Transition hook failed: ${hookError.message}`
          };
        }
      }

      logger.info(`State machine: ${entityName} transitioned '${fromState}' → '${toState}'`, {
        entityId: String(entity._id || ''),
        context: Object.keys(context)
      });

      return { success: true, entity };
    }
  };
}

/**
 * Registration State Machine
 * States: pending → approved | rejected
 *         approved → pending (rollback scenario)
 *         rejected → pending (resubmit scenario)
 */
const registrationMachine = createStateMachine({
  entityName: 'Registration',
  states: ['pending', 'approved', 'rejected'],
  initialState: 'pending',
  transitions: {
    pending: {
      approved: {
        guard: async (entity) => {
          if (!entity.userId) return 'Registration has no associated user';
          return true;
        },
        onTransition: async (entity, ctx) => {
          entity.approvedBy = ctx.adminId || null;
          entity.approvedAt = new Date();
        }
      },
      rejected: {
        guard: async (entity, ctx) => {
          if (!ctx.rejectionReason || ctx.rejectionReason.length < 10) {
            return 'Rejection reason must be at least 10 characters';
          }
          return true;
        },
        onTransition: async (entity, ctx) => {
          entity.rejectionReason = ctx.rejectionReason || '';
        }
      }
    },
    approved: {
      pending: {
        guard: async (entity, ctx) => {
          if (!ctx.adminId) return 'Admin ID required for rollback';
          return true;
        },
        onTransition: async (entity) => {
          entity.approvedBy = null;
          entity.approvedAt = null;
          entity.pickupDate = null;
          entity.pickupNumber = null;
          entity.inventoryAllocations = [];
        }
      }
    },
    rejected: {
      pending: {
        guard: async () => true,
        onTransition: async (entity) => {
          entity.rejectionReason = '';
        }
      }
    }
  }
});

/**
 * ReturnRequest State Machine
 * States: pending → approved | rejected | cancelled
 *         approved → completed
 *         completed → (terminal state)
 *         rejected → (terminal state)
 *         cancelled → (terminal state)
 */
const returnRequestMachine = createStateMachine({
  entityName: 'ReturnRequest',
  states: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
  initialState: 'pending',
  transitions: {
    pending: {
      approved: {
        guard: async (entity, ctx) => {
          if (!ctx.adminId) return 'Admin ID required for approval';
          return true;
        },
        onTransition: async (entity, ctx) => {
          entity.adminDecision = entity.adminDecision || {};
          entity.adminDecision.approvedBy = ctx.adminId;
          entity.adminDecision.approvedAt = new Date();
          if (ctx.adminNotes) entity.adminDecision.adminNotes = ctx.adminNotes;
        }
      },
      rejected: {
        guard: async (entity, ctx) => {
          if (!ctx.rejectionReason || ctx.rejectionReason.length < 10) {
            return 'Rejection reason must be at least 10 characters';
          }
          return true;
        },
        onTransition: async (entity, ctx) => {
          entity.adminDecision = entity.adminDecision || {};
          entity.adminDecision.rejectedBy = ctx.adminId;
          entity.adminDecision.rejectedAt = new Date();
          entity.adminDecision.rejectionReason = ctx.rejectionReason;
          if (ctx.adminNotes) entity.adminDecision.adminNotes = ctx.adminNotes;
        }
      },
      cancelled: {
        guard: async (entity) => {
          if (!entity.userId) return 'Cannot cancel: no user associated';
          return true;
        },
        onTransition: async (entity) => {
          entity.cancelledAt = new Date();
        }
      }
    },
    approved: {
      completed: {
        guard: async (entity, ctx) => {
          const validConditions = ['excellent', 'good', 'fair', 'poor', 'damaged'];
          if (!ctx.receivedCondition || !validConditions.includes(ctx.receivedCondition)) {
            return 'Valid received condition is required to confirm return';
          }
          return true;
        },
        onTransition: async (entity, ctx) => {
          entity.actualReturnDate = new Date();
          entity.returnConfirmation = {
            confirmedBy: ctx.adminId,
            confirmedAt: new Date(),
            receivedCondition: ctx.receivedCondition,
            notes: ctx.notes || ''
          };
        }
      }
    }
  }
});

module.exports = {
  createStateMachine,
  registrationMachine,
  returnRequestMachine
};

