export default function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center
                    justify-center px-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-brand-900/30
                      backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-xl
                      w-full max-w-md p-6 z-10"
           onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}