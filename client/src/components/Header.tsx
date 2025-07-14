import React from "react";

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
  return (
    <div
      className={`relative mb-1 ${
        isFullscreen ? headerStyleFullscreen : headerStyle
      }`}
    >
      {/* Title */}
      <h1
        className={`${
          isFullscreen ? "absolute bottom-2 left-4" : "ml-5"
        } font-bold text-left text-3xl`}
      >
        {title}
      </h1>

      {/* Optional second content */}
      {children && (
        <div
          className={` ${
            isFullscreen ? "" : "mr-5"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Header;
