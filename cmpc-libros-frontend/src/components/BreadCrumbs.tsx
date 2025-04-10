import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";

export const Breadcrumbs = () => {
  const location = useLocation();

  // Definición de los "crumbs" basados en la ruta actual
  const crumbs = [
    { path: '/home', label: 'Gestión de Libros' }, 
    { path: '/users', label: 'Usuarios' },
  ].filter(crumb => crumb !== null && location.pathname.includes(crumb.path)); // Filtra los "crumbs" por la ruta actual y no nulos

  // Convertir los crumbs en el formato esperado por `items`
  const breadcrumbItems = crumbs.map((crumb: any) => ({
    title: <Link to={crumb.path}>{crumb.label}</Link>,
  }));

  return (
    <div className="ml-5 mt-2 mb-2">
      <Breadcrumb separator=">" items={breadcrumbItems} />
    </div>
  );
};
