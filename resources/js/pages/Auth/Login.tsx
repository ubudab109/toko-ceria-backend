import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        invalid: '',
    });

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        post(route('login.process'));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4"
            >
                <h1 className="text-2xl font-bold text-center">Login</h1>

                {errors.invalid && (
                    <p className="text-red-600 text-sm">{errors.invalid}</p>
                )}

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full border rounded p-2"
                    />
                    {errors.email && (
                        <p className="text-red-600 text-sm">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full border rounded p-2"
                    />
                    {errors.password && (
                        <p className="text-red-600 text-sm">{errors.password}</p>
                    )}
                </div>

                <button
                    disabled={processing}
                    className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
                >
                    Login
                </button>
            </form>
        </div>
    );
}