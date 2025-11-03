/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/program/ProgramPage.tsx
import React, { useMemo, useState } from 'react';
import {
  Button,
  Table,
  Input,
  Space,
  Select,
  Drawer,
  Switch,
  Popconfirm,
  Typography,
  Tag,
  Row,
  Col,
  Spin,
  Tooltip,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProgramsService,
  createProgramService,
  updateProgramService,
  deleteProgramService,
} from '../../services/program';
import type { Program, ProgramQueryParams } from '../../services/program/type';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import ProgramForm from './components/ProgramForm';
import { getLanguagesService } from '../../services/language';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Text } = Typography;

const PAGE_SIZE_DEFAULT = 10;

const ProgramPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [languageId, setLanguageId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const params: ProgramQueryParams = useMemo(
    () => ({ keyword: keyword || undefined, languageId, page, pageSize }),
    [keyword, languageId, page, pageSize]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['programs', params],
    queryFn: () => getProgramsService(params),
    retry: 1,
  });

  const { data: languages, isLoading: isLoadingLanguages } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguagesService,
  });

  React.useEffect(() => {
    if (!languageId && languages?.data?.length) {
      setLanguageId(languages.data[0].id); // ✅ auto select first language
    }
  }, [languages, languageId]);

  const createMutation = useMutation({
    mutationFn: (payload: any) => createProgramService(payload),
    onSuccess: () => {
      notifySuccess('Program created');
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setDrawerOpen(false);
    },
    onError: (err: any) => notifyError(err?.message || 'Failed to create program'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      updateProgramService(id, payload),
    onSuccess: () => {
      notifySuccess('Program updated');
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setDrawerOpen(false);
      setEditingProgram(null);
    },
    onError: (err: any) => notifyError(err?.message || 'Failed to update program'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProgramService(id),
    onSuccess: () => {
      notifySuccess('Program deleted');
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
    onError: (err: any) => notifyError(err?.message || 'Failed to delete program'),
  });

  const onSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const onChangeTable = (pagination: TablePaginationConfig) => {
    if (pagination.current) setPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);
  };

  const openCreate = () => {
    setEditingProgram(null);
    setDrawerOpen(true);
  };

  const openEdit = (row: Program) => {
    setEditingProgram(row);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => deleteMutation.mutate(id);

  const handleSubmit = (values: any) => {
    if (editingProgram) {
      // If editing, send only allowed fields
      updateMutation.mutate({ id: editingProgram.programId, payload: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns: ColumnsType<Program> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (val: string) => <Text strong>{val}</Text>,
    },
    {
      title: 'Language',
      dataIndex: 'languageId',
      key: 'languageId',
      render: (val: string) => {
        const found = languages?.data.find((l) => l.id === val);
        return found ? <Tag>{found.langName}</Tag> : <Text type="secondary">{val}</Text>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val: boolean, rec) => (
        <Switch
          checked={val}
          onChange={(checked) =>
            updateMutation.mutate({
              id: rec.programId,
              payload: { status: checked, name: rec.name },
            })
          }
        />
      ),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (val: string) => (val ? new Date(val).toLocaleString() : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: any, record: Program) => (
        <Space>
          <Tooltip title="View levels">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/levels/${record.programId}`)}
            />
          </Tooltip>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Delete this program?"
            onConfirm={() => handleDelete(record.programId)}
            okText="Delete"
            cancelText="Cancel">
            <Button
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return isLoadingLanguages ? (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Spin size="large" />
    </div>
  ) : (
    <div className="p-6">
      <Row
        justify="space-between"
        className="mb-4">
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}>
              Create Program
            </Button>

            <Select
              allowClear
              placeholder="Filter language"
              style={{ width: 200 }}
              options={languages?.data.map((l) => ({ value: l.id, label: l.langName }))}
              defaultValue={languages?.data?.[0] || ''}
              value={languageId}
              onChange={(v) => {
                setLanguageId(v.toString());
                setPage(1);
              }}
            />

            <Search
              placeholder="Search by name"
              onSearch={onSearch}
              allowClear
              style={{ width: 300 }}
            />
          </Space>
        </Col>
      </Row>

      <Table
        rowKey={(r) => r.programId}
        loading={isLoading}
        dataSource={data}
        columns={columns}
        pagination={{
          current: page,
          pageSize,
          total: data?.length,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
        onChange={onChangeTable}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={560}
        destroyOnClose
        title={editingProgram ? 'Edit Program' : 'Create Program'}>
        <ProgramForm
          initialValues={editingProgram || undefined}
          languages={languages?.data.map((l) => ({ id: l.id, name: l.langName })) || []}
          onCancel={() => setDrawerOpen(false)}
          onSubmit={handleSubmit}
        />
      </Drawer>
    </div>
  );
};

export default ProgramPage;
