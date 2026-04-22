<template>
  <div v-if="visible" class="modal-backdrop fade show"></div>
  
  <div v-if="visible" class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow border-0">
        
        <div class="modal-header bg-white border-0 pb-0 justify-content-center">
          <div class="text-warning mb-2">
            <i class="bi bi-exclamation-circle-fill" style="font-size: 3rem;"></i>
          </div>
        </div>

        <div class="modal-body text-center pt-0">
          <h4 class="fw-bold mb-3">{{ $t('confirmModal.title') }}</h4>
          <p class="text-muted mb-4">{{ mensaje || $t('confirmModal.defaultMessage') }}</p>
          
          <div class="d-flex justify-content-center gap-2">
            <button 
              type="button" 
              class="btn btn-outline-secondary px-4" 
              @click="$emit('cerrar')"
            >
              {{ $t('common.cancel') }}
            </button>
            <button 
              type="button" 
              class="btn btn-danger px-4" 
              @click="$emit('confirmar')"
            >
              {{ $t('confirmModal.confirmDelete') }}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: Boolean,
  mensaje: String
})

defineEmits(['cerrar', 'confirmar'])
</script>

<style scoped>
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}
.modal {
  z-index: 1050;
}
</style>