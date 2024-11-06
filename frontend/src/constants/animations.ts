const duration = 0.5;

const slideTopToBottom = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
  transition: { duration },
};

export const routeAnimation = slideTopToBottom;
