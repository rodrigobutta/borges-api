export const getPersons = (persons: any) => {
  const FilterPerson = (loanApplicationNature: string) => {
    return persons.filter((x: any) => x.loanApplicationNature === loanApplicationNature)[0]?.toJSON() || null;
  };

  const buyer = FilterPerson('buyer');
  const couple = buyer?.civilStatus === 'married' ? FilterPerson('couple') : null;
  const cosigner = FilterPerson('garant') || null;

  return { buyer, couple, cosigner };
};
