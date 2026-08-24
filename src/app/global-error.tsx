"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="ru-KZ"><body><main className="grid min-h-screen place-items-center bg-[#f5f7f5] p-6"><div className="max-w-lg rounded-xl bg-white p-8 text-center shadow-lg"><h1 className="text-2xl font-bold">Что-то пошло не так</h1><p className="mt-3 text-gray-600">Не удалось загрузить страницу. Попробуйте ещё раз.</p><button onClick={reset} className="mt-6 rounded-md bg-green-800 px-5 py-3 font-semibold text-white">Повторить</button></div></main></body></html>;
}
