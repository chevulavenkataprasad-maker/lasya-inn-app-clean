// src/utils/soundService.js

// ============================================
// ✅ PLAY NOTIFICATION SOUND
// ============================================
export const playNotificationSound = (type = 'default') => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'admin') {
      // Admin: Double beep (higher pitch)
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      // First beep
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 300);
      
      // Second beep (after 400ms)
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        gain2.gain.value = 0.3;
        osc2.start();
        setTimeout(() => {
          osc2.stop();
        }, 250);
      }, 400);
      
    } else if (type === 'user') {
      // User: Single beep (lower pitch)
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 400);
      
    } else {
      // Default beep
      oscillator.frequency.value = 700;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 300);
    }
    
    console.log('🔊 Sound played:', type);
    
  } catch (error) {
    console.log('Sound play failed:', error);
  }
};