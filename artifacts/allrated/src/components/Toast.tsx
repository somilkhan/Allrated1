interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      className={`fixed bottom-[100px] left-1/2 z-[500] -translate-x-1/2 rounded-full border border-white/[0.09] bg-ink-500 px-5 py-3 text-[13px] font-semibold shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-300 ${
        message
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      {message}
    </div>
  );
}
