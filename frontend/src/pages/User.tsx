import { Button, Modal, Spin, Table, Tag, message } from "antd";
import { useEffect, useState } from "react";
import Search from "antd/es/input/Search";
import { IUser } from "../interfaces/IUser";
import { ColumnsType, TableProps } from "antd/lib/table";
import { GetProp } from "antd/lib";
import UserForm from "../components/user/UserForm";
import { createUser, getUsers, updateUser } from "../services/userService";

type TablePaginationConfig = Exclude<GetProp<TableProps, "pagination">, boolean>;

interface TableParams {
  pagination?: TablePaginationConfig;
}

export const User = () => { 

  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [_, setError] = useState<any>(null);

  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const [searchText, setSearchText] = useState<string | undefined>(undefined);

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const fetchUsers = async (qs?: string) => {
    setLoading(true);
    try {
      const data = await getUsers(qs);
      if (data) {
        setUsers(data.rows);
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

  useEffect(() => {
    const limit = tableParams!.pagination!.pageSize!;
    const page = (tableParams!.pagination!.current! - 1) * limit;

    const params: Record<string, string | number | undefined> = {
      page: page,
      text: searchText,
      size: limit,
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    );

    const parsedQueryString = new URLSearchParams(
      filteredParams as Record<string, string>
    ).toString();

    fetchUsers(parsedQueryString);
  }, [searchText, tableParams.pagination?.pageSize, tableParams.pagination?.current]);

  const onSearch = async (text: string) => {
    setSearchText(text);
  };

  const handleTableChange: TableProps<any>["onChange"] = (pagination) => {
    setTableParams({
      pagination,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setUsers([]);
    }
  };

  const handleEdit = (user: IUser) => {
    setSelectedUser(Number(user.id));
    setIsModalOpen(true);
  }; 

  const handleModalOk = async (updatedUser: IUser) => {
    try {
      if(updatedUser.id){
        const res=await updateUser(Number(updatedUser.id), updatedUser); 
        if(res){
          message.success("Usuario actualizado con éxito");
          setIsModalOpen(false);
          fetchUsers();
        }
  
      }else {
        const res =await createUser(updatedUser) 
        if(res){
          message.success("Usuario create con éxito"); 
          setIsModalOpen(false);
          fetchUsers();
        }
      }
    } catch (error) {
      message.error("Error al actualizar el usuario");
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const columns: ColumnsType = [
    {
      title: "Usuario",
      dataIndex: "username",
      width: "40%",
      responsive: ["md", "sm", "xs"],
    },
    {
      title: "Datos Personales",
      dataIndex: "name",
      width: "40%",
      responsive: ["md", "sm", "xs"],
      render: (_name,_) => (
        ""+_.nombre+" "+_.apellido
      )
    },
    {
      title: "Email",
      dataIndex: "email",
      width: "40%",
      responsive: ["md", "sm", "xs"],
    },
    {
      title: "Permisos",
      dataIndex: "rol",
      width: "40%",
      responsive: ["md", "sm", "xs"],
    },
    {
      title: "Estado",
      dataIndex: "enabled",
      width: "30%",
      responsive: ["md", "sm", "xs"],
      render: (enabled) => (
        <Tag color={enabled ? "green" : "red"}>
          {enabled ? "Habilitado" : "Deshabilitado"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      dataIndex: "actions",
      width: "20%",
      align: "center",
      render: (_, record: any) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Editar
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="mb-3 flex items-center">
        <Search
          placeholder="Buscar..."
          allowClear
          onSearch={onSearch}
          className="w-1/4 mr-1"
        />
        {tableParams.pagination?.total} resultados
        <Button type="primary" className="ml-auto" onClick={() => { setSelectedUser(null); setIsModalOpen(true) }}>
          Nuevo usuario
        </Button>
      </div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          loading={loading}
          dataSource={users}
          pagination={tableParams.pagination}
          onChange={handleTableChange}
          rowKey="id"
        />
      )}
      <Modal
        title={selectedUser?"Editar Usuario":"Nuevo Usuario"}
        open={isModalOpen}
        onCancel={handleModalCancel}
        footer={null}
      > 
          <UserForm
            userId={selectedUser?selectedUser:null}
            onSubmit={handleModalOk}
            onCancel={handleModalCancel}
          /> 
      </Modal>
    </>
  );
};

export default User;
