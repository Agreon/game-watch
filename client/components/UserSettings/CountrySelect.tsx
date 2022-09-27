import { Country } from '@game-watch/shared';
import { Select, SingleValue } from 'chakra-react-select';
import React, { useCallback, useMemo } from 'react';

interface CountryOption {
    value: Country
    label: string
}

const countryLabels: Record<Country, string> = {
    'AR-ES': 'Argentina',
    'AT': 'Austria',
    'AU': 'Australia',
    'BE-FR': 'Belgium (French)',
    'BE-NL': 'Belgium (Dutch)',
    'BG': 'Bulgaria',
    'BR-PT': 'Brasilia',
    'CA-EN': 'Canada (English)',
    'CA-FR': 'Canada (French)',
    'CH-DE': 'Switzerland (German)',
    'CH-FR': 'Switzerland (French)',
    'CH-IT': 'Switzerland (Italian)',
    'CL-ES': 'Chile',
    'CO-ES': 'Colombia',
    'CZ': 'Czechia',
    'DE': 'Germany',
    'DK': 'Denmark',
    'EE': 'Estonia',
    'ES': 'Spain',
    'FI': 'Finland',
    'FR': 'France',
    'GR': 'Greece',
    'HR': 'Croatia',
    'HU': 'Hungary',
    'IE': 'Ireland',
    'IT': 'Italy',
    'MX-ES': 'Mexiko',
    'NL': 'Netherlands',
    'NO': 'Norway',
    'NZ': 'New Zealand',
    'PE-ES': 'Peru',
    'PL': 'Poland',
    'PT': 'Portugal',
    'RO': 'Romania',
    'RU': 'Russia',
    'SE': 'Sweden',
    'SI': 'Slovenia',
    'SK': 'Slovakia',
    'TR': 'Turkey',
    'UK': 'United Kingdom',
    'US': 'USA',
    'ZA': 'South Africa',
} as const;

const countryOptions: CountryOption[] = Object.entries(countryLabels).map(
    // Thanks for nothing typescript :/
    ([value, label]) => ({ value: value as Country, label })
);

interface CountrySelectOptions {
    value: Country;
    onChange: (value: Country) => void;
}

export const CountrySelect: React.FC<CountrySelectOptions> = ({ value, onChange }) => {
    const onCountryChanges = useCallback((newValue: SingleValue<CountryOption>) => {
        if (!newValue) {
            return;
        }
        onChange(newValue.value);
    }, [onChange]);

    const countryValue = useMemo(() => ({
        value,
        label: countryLabels[value]
    }), [value]);

    return (
        <Select<CountryOption>
            chakraStyles={{
                dropdownIndicator: provided => ({
                    ...provided,
                    background: 'grey.700',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                }),
                valueContainer: provided => ({
                    ...provided,
                    paddingLeft: '0.5rem'
                }),
                indicatorSeparator: () => ({
                    display: 'none'
                }),
                control: provided => ({
                    ...provided,
                    border: 0,
                    borderBottom: '1px',
                    borderRadius: 0,
                    borderColor: 'white',
                    boxShadow: 'none !important',
                }),
                option: provided => ({
                    ...provided,
                    paddingLeft: '0.5rem'
                }),
                menu: provided => ({
                    ...provided,
                    padding: 0,
                    marginTop: 0,
                }),
                menuList: provided => ({
                    ...provided,
                    padding: 0,
                    borderRadius: 0,
                })
            }}
            value={countryValue}
            onChange={onCountryChanges}
            options={countryOptions}
            isSearchable={true}
        />
    );
};
