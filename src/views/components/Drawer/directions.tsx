export const directions = (isOpen: boolean) => ({
  right: {
    transform: isOpen ? "translateX(-100%)" : "translateX(100%)",
    top: 0,
    left: "100%",
  },
  left: {
    transform: isOpen ? "translateX(100%)" : "translateX(-100%)",
    top: 0,
    right: "100%",
  },
  top: {
    transform: isOpen ? "translateY(100%)" : "translateY(-100%)",
    left: 0,
    bottom: "100%",
  },
  bottom: {
    transform: isOpen ? "translateY(-100%)" : "translateY(100%)",
    left: 0,
    top: "100%",
  },
});
