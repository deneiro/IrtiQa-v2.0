import { Debt } from '../model/types'

/**
 * Calculates the net balance for a contact based on their debts.
 * Positive value: contact owes user.
 * Negative value: user owes contact.
 */
export const calculateContactBalance = (debts: Debt[], contactId: string): number => {
  return debts
    .filter(debt => debt.contact_id === contactId && !debt.is_settled)
    .reduce((acc, debt) => {
      if (debt.direction === 'they_owe') {
        return acc + Number(debt.amount)
      } else {
        return acc - Number(debt.amount)
      }
    }, 0)
}

/**
 * Calculates overall balance across all contacts.
 */
export const calculateTotalBalance = (debts: Debt[]): number => {
  return debts
    .filter(debt => !debt.is_settled)
    .reduce((acc, debt) => {
      if (debt.direction === 'they_owe') {
        return acc + Number(debt.amount)
      } else {
        return acc - Number(debt.amount)
      }
    }, 0)
}
