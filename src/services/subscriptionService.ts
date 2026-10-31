import { KitNumber, TuneSetNumber, SubscriptionTier } from '../types/octapad'

/**
 * =========================================================================
 * KHAROL BROTHERS OCTAPAD - FUTURE SUBSCRIPTION ARCHITECTURE
 * =========================================================================
 * Designed for seamless future activation without redesigning the Octapad.
 *
 * Current State:
 * - enforceGates = false
 * - All 3 Kits and all 12 Tune Sets (96 pads) are 100% accessible to the owner.
 * - No payment gateways, UPI, or subscription restrictions shown to users now.
 *
 * Future Activation (when enforceGates = true):
 * - FREE USER:
 *     - Access to KIT 1, KIT 2, KIT 3
 *     - Only Tune Set 1 in each Kit (Total 24 default sound assignments)
 *     - Tune Sets 2, 3, and 4 are locked
 * - PREMIUM USER:
 *     - All 3 Kits
 *     - All 4 Tune Sets in every Kit (Total 96 sound assignments)
 *     - Full Sound Designer and custom sound editing
 * =========================================================================
 */

export interface SubscriptionConfig {
  enforceGates: boolean
  defaultTier: SubscriptionTier
}

const LOCAL_STORAGE_SUB_KEY = 'kb_octapad_subscription_tier'
const LOCAL_STORAGE_GATES_KEY = 'kb_octapad_enforce_subscription_gates'

class SubscriptionService {
  // By default, enforceGates is FALSE so owner/admin can test the entire 96-pad system right now
  private enforceGates: boolean = false
  private currentTier: SubscriptionTier = 'premium'

  constructor() {
    this.loadState()
  }

  private loadState() {
    try {
      const storedTier = localStorage.getItem(LOCAL_STORAGE_SUB_KEY) as SubscriptionTier | null
      if (storedTier === 'free' || storedTier === 'premium') {
        this.currentTier = storedTier
      }

      const storedGates = localStorage.getItem(LOCAL_STORAGE_GATES_KEY)
      if (storedGates !== null) {
        this.enforceGates = storedGates === 'true'
      }
    } catch {}
  }

  /**
   * Returns whether subscription access gates are currently enforced
   */
  isGatesEnforced(): boolean {
    return this.enforceGates
  }

  /**
   * Allows toggling gate enforcement for future activation
   */
  setGatesEnforced(enforce: boolean) {
    this.enforceGates = enforce
    try {
      localStorage.setItem(LOCAL_STORAGE_GATES_KEY, String(enforce))
    } catch {}
  }

  /**
   * Returns current user subscription tier ('free' | 'premium')
   */
  getCurrentTier(): SubscriptionTier {
    return this.currentTier
  }

  /**
   * Sets current tier
   */
  setCurrentTier(tier: SubscriptionTier) {
    this.currentTier = tier
    try {
      localStorage.setItem(LOCAL_STORAGE_SUB_KEY, tier)
    } catch {}
  }

  /**
   * Evaluates if a given Kit & Tune Set is accessible.
   * In current development mode (gates not enforced), always returns true!
   */
  canAccessTuneSet(kitNum: KitNumber, tuneSetNum: TuneSetNumber): boolean {
    if (!this.enforceGates) {
      return true
    }

    // In future active mode:
    if (this.currentTier === 'premium') {
      return true
    }

    // Free tier: only Tune Set 1 is accessible; Tune Sets 2, 3, 4 are locked
    return tuneSetNum === 1
  }

  /**
   * Evaluates if Sound Designer custom features are accessible.
   * In current development mode (gates not enforced), always returns true!
   */
  canAccessSoundDesigner(): boolean {
    if (!this.enforceGates) {
      return true
    }

    return this.currentTier === 'premium'
  }

  /**
   * Returns detailed access metadata for UI presentation
   */
  getTuneSetAccessInfo(kitNum: KitNumber, tuneSetNum: TuneSetNumber): {
    isAccessible: boolean
    isLocked: boolean
    requiredTier: SubscriptionTier
    tierName: string
  } {
    const isAccessible = this.canAccessTuneSet(kitNum, tuneSetNum)
    const isTuneSet1 = tuneSetNum === 1

    return {
      isAccessible,
      isLocked: !isAccessible,
      requiredTier: isTuneSet1 ? 'free' : 'premium',
      tierName: isTuneSet1 ? 'Free' : 'Premium'
    }
  }
}

export const subscriptionService = new SubscriptionService()

