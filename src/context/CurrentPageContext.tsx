import React, { useState, createContext, useContext } from 'react';

import type { _CurrentPageContext } from '@/utils/types';

export const CurrentPageContext = createContext<_CurrentPageContext>({ title: "", setTitle: null });

export const useCurrentPageContext = () => useContext(CurrentPageContext);

export const CurrentPageContextProvider = ({
    children,
}: React.PropsWithChildren) => {
    const [title, setTitle] = useState<string>("")

    return (
        <CurrentPageContext.Provider value={{ title, setTitle }}>
            {children}
        </CurrentPageContext.Provider>
    );
};