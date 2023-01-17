// At least steam returns dates in unspecific ranges like checked below.
const NonSpecificDateRegex = /^(Winter |Summer |Spring |Fall |Jan |Feb |Mar |Apr |Mai |Jun |Jul |Aug |Sep |Oct |Nov |Dec )?(20(\d\d))$/;

export const isNonSpecificDate = (date: string) =>
    NonSpecificDateRegex.test(date);
