import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { RailwayBoard } from './desi/DesiPop';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen w-full bg-[#EFE6D2] text-[#16130F] flex flex-col items-center justify-center px-6 pt-28 pb-16 overflow-hidden">
            <h1 className="sr-only">Page not found (404)</h1>

            <RailwayBoard hi="गलत स्टेशन" en="WRONG STATION" codeLeft="PF 404" codeRight="UNICOACH JN." className="w-[88vw] sm:w-[420px]" />

            <p className="mt-8 font-['Yatra_One',sans-serif] text-[22px] sm:text-[26px] text-center leading-snug">
                Yeh station hamare map par nahi hai.
            </p>
            <p className="mt-2 text-[14.5px] text-slate-600 text-center max-w-md">
                The page you are looking for has moved or never existed. Take the next train home.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="w-full sm:w-1/2 py-3.5 rounded-full border-2 border-[#16130F] bg-white hover:bg-[#F2C230] text-[13px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={14} />
                    <span>Go back</span>
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full sm:w-1/2 py-3.5 rounded-full bg-[#DE5C2B] hover:bg-[#C04A1D] text-white text-[13px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                    <Home size={14} />
                    <span>Go home</span>
                </button>
            </div>
        </main>
    );
};

export default NotFound;
