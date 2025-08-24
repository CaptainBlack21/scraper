import React from "react";

interface Props {
  onConfirm: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const DeleteButton: React.FC<Props> = ({ onConfirm, children, style }) => {
  const handleClick = () => {
    if (window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      onConfirm();
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        border: "none",
        backgroundColor: "#dc3545",
        color: "#fff",
        cursor: "pointer",
        transition: "background-color 0.2s",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c82333")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#dc3545")}
    >
      {children || "Sil"}
    </button>
  );
};

export default DeleteButton;
