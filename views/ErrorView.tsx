const ErrorView = ({...props}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h2 className="text-xl font-bold text-red-500 mb-4">Error</h2>
                <p className="text-gray-700 mb-4">{props.errorMessage}</p>
            </div>
        </div>
    )
}

export default ErrorView;