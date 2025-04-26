import { useContext } from 'react';
import LanguageContext from './LanguageContext';
import translations from './Translations';

function MyButton(props) {
    const obj = useContext(LanguageContext);
    const language = obj.lang;
    const toggleLanguage = obj.toggleLanguage;
    return (
        <button onClick={toggleLanguage}>
            {translations[language]['button']}
        </button>
    );
}

function Welcome(props) {
    const obj = useContext(LanguageContext);
    const language = obj.lang;
    return (
        <p> {translations[language]['welcome']} </p>
    );
}

export {MyButton, Welcome};