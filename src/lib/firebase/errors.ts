/**
 * Translates Firebase Auth error codes into polite, human-readable Indonesian messages.
 */
export function getHumanAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid. Pastikan penulisan email sudah benar.';
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan. Silakan hubungi tim dukungan Nuvell.';
    case 'auth/user-not-found':
      return 'Akun dengan email ini tidak ditemukan. Silakan periksa kembali atau buat akun baru.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau kata sandi yang Anda masukkan salah. Silakan coba lagi.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan masuk menggunakan akun tersebut atau gunakan email lain.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu pendek. Gunakan minimal 6 karakter kombinasi huruf dan angka.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat sebelum mencoba kembali.';
    case 'auth/popup-closed-by-user':
      return 'Jendela masuk Google ditutup sebelum proses selesai. Silakan coba lagi.';
    case 'auth/popup-blocked':
      return 'Jendela popup masuk diblokir oleh peramban Anda. Mohon izinkan popup untuk situs ini.';
    case 'auth/network-request-failed':
      return 'Koneksi jaringan bermasalah. Pastikan perangkat Anda terhubung ke internet.';
    case 'auth/requires-recent-login':
      return 'Operasi ini memerlukan login ulang. Silakan masuk kembali ke akun Anda.';
    case 'auth/account-exists-with-different-credential':
      return 'Akun dengan email ini sudah terdaftar menggunakan metode masuk yang berbeda.';
    default:
      return 'Terjadi kendala saat memproses autentikasi. Silakan coba beberapa saat lagi.';
  }
}
