export function mapAuthErrorMessage(message: string): string {
  if (message.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (message.includes('Email not confirmed')) return '이메일 인증이 완료되지 않았습니다. 받은 메일함을 확인해주세요.'
  if (message.includes('User already registered')) return '이미 가입된 이메일입니다.'
  if (message.includes('Password should be at least')) return '비밀번호는 6자 이상이어야 합니다.'
  if (message.includes('Unable to validate email address')) return '올바른 이메일 형식이 아닙니다.'
  return message
}
