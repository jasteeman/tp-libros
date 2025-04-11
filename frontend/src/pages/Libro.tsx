import { Button, message, Modal, Select, Spin, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import Search from "antd/es/input/Search";
import {
  createLibro,
  deleteLibro,
  exportLibrosExcel,
  getLibros,
  updateLibro,
} from "../services/LibroService";
import { ColumnsType, TableProps } from "antd/lib/table";
import { GetProp } from "antd/lib";
import { Libro } from "../interfaces/ILibro";
import LibroForm from "../components/libro/LibroForm";
import { SortOrder } from "antd/lib/table/interface";
import debounce from "lodash/debounce";


type TablePaginationConfig = Exclude<GetProp<TableProps, "pagination">, boolean>;

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: SortOrder;
}

export const GestionLibros = () => {
  const [data, setData] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [_, setError] = useState<any>(null);

  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [disponibilidadFilter, setDisponibilidadFilter] = useState<boolean | undefined>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLibro, setEditingLibro] = useState<Libro | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    const limit = tableParams!.pagination!.pageSize!;
    const page = tableParams!.pagination!.current! - 1;

    const params: Record<string, string | number | boolean | undefined> = {
      page: page,
      limit: limit,
      search: searchText,
      disponibilidad: disponibilidadFilter,
      sortField: tableParams.sortField,
      sortOrder: tableParams.sortOrder === "ascend" ? "asc" : tableParams.sortOrder === "descend" ? "desc" : undefined,
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
    );
    const parsedQueryString = new URLSearchParams();
    for (const key in filteredParams) {
      if (filteredParams.hasOwnProperty(key) && filteredParams[key] !== undefined) {
        parsedQueryString.append(key, String(filteredParams[key]));
      }
    }
    const queryString = parsedQueryString.toString();
    try {
      const data = await getLibros(queryString);
      if (data) {
        setData(data.rows);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: data.count,
          },
        });
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    sortField: undefined,
    sortOrder: undefined,
  });

  useEffect(() => {
    fetchList();
  }, [searchText, tableParams.pagination?.pageSize, tableParams.pagination?.current, disponibilidadFilter, tableParams.sortField, tableParams.sortOrder]);

  const debouncedSearch = debounce((text: string) => {
    setSearchText(text);
  }, 300); // 300ms de retraso

  const onSearch = (text: string) => {
    debouncedSearch(text);
  };

  const handleTableChange: TableProps<Libro>["onChange"] = (pagination, _filters, sorter) => {
    let sortField: string | undefined = undefined;
    let sortOrder: SortOrder | undefined = undefined;

    if (Array.isArray(sorter)) {
      if (sorter.length > 0) {
        sortField = sorter[0].field as string | undefined;
        sortOrder = sorter[0].order;
      }
    } else {
      sortField = sorter.field as string | undefined;
      if (sorter && sorter.order && (sorter.order === "ascend" || sorter.order === "descend")) {
        sortOrder = sorter.order;
      }
    }

    setTableParams({
      ...tableParams,
      pagination,
      sortField,
      sortOrder,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const getColumns = (): ColumnsType<Libro> => [
    {
      title: "Título",
      dataIndex: "titulo",
      width: "30%",
      responsive: ["md", "sm", "xs"],
      sorter: true,
    },
    {
      title: "Autor",
      dataIndex: "autor",
      width: "25%",
      responsive: ["md", "sm", "xs"],
      sorter: true,
    },
    {
      title: "Género",
      dataIndex: "genero",
      width: "15%",
      responsive: ["md", "sm", "xs"],
      sorter: true,
    },
    {
      title: "Editorial",
      dataIndex: "editorial",
      width: "15%",
      responsive: ["md", "sm", "xs"],
      sorter: true,
    },
    {
      title: "Precio",
      dataIndex: "precio",
      width: "15%",
      responsive: ["md", "sm", "xs"],
      sorter: true,
    },
    {
      title: "Disponibilidad",
      dataIndex: "disponibilidad",
      width: "15%",
      responsive: ["md"],
      render: (disponibilidad) => (
        <Tag color={disponibilidad ? "green" : "red"}>
          {disponibilidad ? "Disponible" : "No Disponible"}
        </Tag>
      ),
      sorter: {
        compare: (a, b) => (a.disponibilidad === b.disponibilidad ? 0 : a.disponibilidad ? -1 : 1),
        multiple: 1,
      },
    },
    {
      title: "Acciones",
      dataIndex: "actions",
      width: "20%",
      align: "center",
      render: (_, record: Libro) => (
        <>
          <Button type="link" onClick={() => handleCreateEdit(record)}>
            Editar
          </Button>
          <Button type="link" danger onClick={() => handleRemove(record)}>
            Eliminar
          </Button>
        </>
      ),
    },
  ];

  const handleCreateEdit = (libro?: Libro) => {
    setEditingLibro(libro || null);
    setIsModalOpen(true);
  };

  const exportExcel = async () => {
    const res = await exportLibrosExcel();
    if (res) {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(res);
      link.download = `libro.xlsx`;
      link.click();
    }
  };

  const handleFormSubmit = async (values: Libro) => {
    setFormLoading(true);
    try {
      if (editingLibro?.id) {
        const updatedLibro = await updateLibro(editingLibro.id, values);
        if (updatedLibro) {
          message.success("Libro actualizado exitosamente");
        } else {
          message.error("Error al actualizar el libro");
        }
      } else {
        const newLibro = await createLibro(values);
        if (newLibro) {
          message.success("Libro creado exitosamente");
        } else {
          message.error("Error al crear el libro");
        }
      }
      fetchList();
      setIsModalOpen(false);
      setEditingLibro(null);
    } catch (error) {
      message.error("Error al guardar el libro");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingLibro(null);
  };

  const handleRemove = async (libro: Libro) => {
    Modal.confirm({
      title: "¿Estás seguro de eliminar este libro?",
      content: `Título: ${libro.titulo}, Autor: ${libro.autor}`,
      onOk: async () => {
        const deleted = await deleteLibro(Number(libro.id));
        if (deleted) {
          message.success("Libro eliminado exitosamente");
          fetchList();
        } else {
          message.error("Error al eliminar el libro");
        }
      },
    });
  };

  return (
    <>
      <div className="mb-3 flex items-center">
        <Search
          placeholder="Buscar por título, autor, género, editorial..."
          allowClear
          onSearch={onSearch}
          className="w-1/4 mr-1"
        />
        <div className="mr-2">{tableParams.pagination?.total} resultados</div>
        <div className="ml-auto">
          <Button type="link" onClick={() => exportExcel()}>
            Exportar Excel
          </Button>
          <Button type="primary" onClick={() => handleCreateEdit()}>
            Nuevo Libro
          </Button>
        </div>
      </div>
      <div className="mb-3 flex items-center">
        <Select
          placeholder="Disponibilidad"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => setDisponibilidadFilter(value === "" ? undefined : value === "true")}
          value={disponibilidadFilter === undefined ? "" : String(disponibilidadFilter)}
        >
          <Select.Option value="">Todos</Select.Option>
          <Select.Option value="true">Disponible</Select.Option>
          <Select.Option value="false">No Disponible</Select.Option>
        </Select>
      </div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Table
            columns={getColumns()}
            loading={loading}
            dataSource={data}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            rowKey="id"
          />
          <Modal
            title={editingLibro ? "Editar Libro" : "Nuevo Libro"}
            open={isModalOpen}
            onCancel={handleCancelModal}
            footer={null}
          >
            <LibroForm
              initialValues={editingLibro || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelModal}
              loading={formLoading}
            />
          </Modal>
        </>
      )}
    </>
  );
};

export default GestionLibros;