import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { countryByCode } from '@/core/geo';

/**
 * Country choice for the whole app (website: CountrySwitcher + amc_country cookie): listings, deals, shops and
 * Wanted are shown for this country. Remembered on the phone. Default: All countries.
 */
const KEY = 'amc_country';
type Pref = { code: string | null; name: string | null; setCode: (code: string | null) => void };
const Ctx = createContext<Pref>({ code: null, name: null, setCode: () => {} });

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [code, setCodeState] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => { if (v && /^[A-Z]{2}$/.test(v) && countryByCode(v)) setCodeState(v); }).catch(() => {});
  }, []);
  const setCode = (c: string | null) => {
    setCodeState(c);
    AsyncStorage.setItem(KEY, c ?? 'ALL').catch(() => {});
  };
  return <Ctx.Provider value={{ code, name: code ? countryByCode(code)?.name ?? null : null, setCode }}>{children}</Ctx.Provider>;
}

export const useCountry = () => useContext(Ctx);
