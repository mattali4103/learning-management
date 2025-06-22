import { MessageCircleWarning } from "lucide-react"

interface ErrorMessageModalProps {
  message: string | null;
  isOpen : boolean;
  onClose?: () => void;
}

const ErrorMessageModal = (props : ErrorMessageModalProps) =>{

  if( !props.isOpen ) {
    return null;
  }
  const handleCloseMessage = () => {
    if (props.onClose) {
      props.onClose();
    }
  }

    return(
      <div className="fixed bottom-0 right-0 z-10 w-[480px] mr-5 ">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-gray-100 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                  <MessageCircleWarning className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h1 
                    className="text-2xl font-semibold "
                    id="modal-title"
                  >
                    Thông báo
                  </h1>
                  <div className="mt-2">
                    <p className="text-base">
                      {props.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 z-99999 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                onClick={() => handleCloseMessage()}
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      </div>
    );
}
export default ErrorMessageModal;