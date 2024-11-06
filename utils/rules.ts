export const rules = {
  required: (value: string | null) => !!value || 'Required.',
  pwd: (pwd: string | null) => {
    if (!pwd) return 'Required.'

    pwd = pwd.trim()

    const isPassword = /^[\da-zA-Z@#]+$/.test(pwd)

    if (pwd.length < 6 || pwd.length > 30) return 'Password must 8 to 30 characters.'
    if (!isPassword) return 'Invalid password format.'

    return true
  },
  counter: (value: string) => value.length <= 20 || 'Max 20 characters',
  email: (value: string) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || 'Invalid e-mail.';
  },
};