// components/auth/FormInput.tsx
interface FormInputProps {
    id: string;
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
  }
  
  export function FormInput({
    id,
    label,
    type,
    value,
    onChange,
    error,
    required = true,
  }: FormInputProps) {
    return (
      <div className="mb-4">
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
  
  // components/auth/SubmitButton.tsx
  interface SubmitButtonProps {
    loading: boolean;
    children: React.ReactNode;
  }
  
  export function SubmitButton({ loading, children }: SubmitButtonProps) {
    return (
      <button
        type="submit"
        disabled={loading}
        className={`
          w-full flex justify-center py-2 px-4 border border-transparent rounded-md
          shadow-sm text-sm font-medium text-white
          ${loading 
            ? 'bg-indigo-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }
        `}
      >
        {loading ? 'Processing...' : children}
      </button>
    );
  }