export const PASSWORD_RULES = [
  {
    key: 'length',
    label: 'Au moins 8 caractères',
    test: (value = '') => value.length >= 8,
  },
  {
    key: 'lowercase',
    label: 'Au moins une lettre minuscule',
    test: (value = '') => /[a-z]/.test(value),
  },
  {
    key: 'uppercase',
    label: 'Au moins une lettre majuscule',
    test: (value = '') => /[A-Z]/.test(value),
  },
  {
    key: 'number',
    label: 'Au moins un chiffre',
    test: (value = '') => /\d/.test(value),
  },
  {
    key: 'special',
    label: 'Au moins un caractère spécial',
    test: (value = '') => /[^A-Za-z0-9]/.test(value),
  },
];

export const getPasswordChecks = (value = '') => {
  const input = typeof value === 'string' ? value : '';
  return PASSWORD_RULES.reduce((acc, rule) => {
    acc[rule.key] = rule.test(input);
    return acc;
  }, {});
};

export const isPasswordCompliant = (value = '') =>
  Object.values(getPasswordChecks(value)).every(Boolean);
