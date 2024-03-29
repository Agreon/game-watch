// At least steam returns dates in unspecific ranges like checked below.
// eslint-disable-next-line max-len
const NonSpecificDateRegex = /^(Winter |Summer |Spring |Fall |Jan |Feb |Mar |Apr |Mai |Jun |Jul |Aug |Sep |Oct |Nov |Dec |Q1 |Q2 |Q3 |Q4 )?(20(\d\d))$/;

export const isNonSpecificDate = (date: string) =>
    NonSpecificDateRegex.test(date);
