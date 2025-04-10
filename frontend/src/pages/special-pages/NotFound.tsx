import { Link } from "react-router-dom"

const NotFound = () => {
    return (
        <section className="bg-white flex h-screen">
            <div className="py-8 px-4 m-auto max-w-screen-xl lg:py-16 lg:px-6">
                <div className="mx-auto max-w-screen-sm text-center">
                    <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-gray-500 text-primary-600">404</h1>
                    <p className="mb-4 text-3xl tracking-tight font-bold text-gray-500 md:text-4xl">OOOPS!!!</p>
                    <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">No se puede encontrar la ruta o página requerida. </p>
                    <Link to="/" className="inline-flex bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4">Regresar al home</Link>
                </div>
            </div>
        </section>

    )
}

export default NotFound