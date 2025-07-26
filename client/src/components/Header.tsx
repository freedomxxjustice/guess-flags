import React from "react";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  isFullscreen: boolean;
  headerStyle: string;
  headerStyleFullscreen: string;
  title: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  isFullscreen,
  headerStyle,
  headerStyleFullscreen,
  title,
  children,
}) => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  const changeLanguage = (lng: "en" | "ru") => {
    i18n.changeLanguage(lng);
  };

  return (
    <div
      className={`relative flex items-center justify-between ${
        isFullscreen ? headerStyleFullscreen : headerStyle
      }`}
    >
      <h1
        className={`${
          isFullscreen ? "absolute bottom-2 left-4" : "ml-5"
        } font-bold text-left text-3xl`}
      >
        {title}
      </h1>

      {/* Language Switcher */}
      <div
        className={`flex items-center gap-2 text-sm ${
          isFullscreen ? "absolute bottom-2 right-4" : "mr-5"
        }`}
      >
        <button
          onClick={() => changeLanguage("en")}
          className={`px-2 py-1 rounded ${
            i18n.language === "en"
              ? "bg-white text-black"
              : "bg-gray-700 text-white"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => changeLanguage("ru")}
          className={`px-2 py-1 rounded ${
            i18n.language === "ru"
              ? "bg-white text-black"
              : "bg-gray-700 text-white"
          }`}
        >
          RU
        </button>
      </div>

      {/* Additional children */}
      {children && (
        <div className={`${isFullscreen ? "" : "mr-5"}`}>{children}</div>
      )}
    </div>
  );
};

export default Header;
