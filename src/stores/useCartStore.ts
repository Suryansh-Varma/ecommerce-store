// ============================================================
// stores/useCartStore.ts — Re-export shim
// ============================================================
// WHY: The canonical cart store has moved to src/store/useCartStore.ts
// (singular 'store', matching the target folder structure).
//
// All existing pages import from '@/stores/useCartStore' (plural).
// Rather than updating every import path immediately, this shim
// re-exports everything from the new location.
// This is removed in Phase 7 cleanup once all imports are updated.
// ============================================================

export { useCartStore, type CartItem } from '@/store/useCartStore';