import React from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Card, message } from 'antd';
import dayjs from 'dayjs';
import { GraduationCap } from 'lucide-react';
import type { Class } from '@/services/class/type';

interface EditClassModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<Class>) => Promise<any>;
  initialValues: Partial<Class>;
  loading?: boolean;
}

const EditClassModal: React.FC<EditClassModalProps> = ({ visible, onClose, onSubmit, initialValues, loading }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...initialValues,
        startDateTime: initialValues.startDateTime ? dayjs(initialValues.startDateTime) : undefined,
        endDateTime: initialValues.endDateTime ? dayjs(initialValues.endDateTime) : undefined,
      });
    }
  }, [visible, initialValues, form]);

  const [submitting, setSubmitting] = React.useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Client-side checks
      if (values.startDateTime && values.endDateTime && values.endDateTime.isBefore(values.startDateTime)) {
        form.setFields([{ name: 'endDateTime', errors: ['Ngày kết thúc phải sau ngày bắt đầu'] }]);
        return;
      }

      if (values.startDateTime && values.startDateTime.isBefore(dayjs().add(7, 'day'))) {
        form.setFields([{ name: 'startDateTime', errors: ['Ngày bắt đầu phải cách ít nhất 7 ngày kể từ hôm nay'] }]);
        return;
      }

      const payload: Partial<any> = {
        ...values,
        startDateTime: values.startDateTime ? values.startDateTime.toISOString() : undefined,
        endDateTime: values.endDateTime ? values.endDateTime.toISOString() : undefined,
      };

      setSubmitting(true);
      await onSubmit(payload);
      setSubmitting(false);
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      // If validation error from AntD, just return
      if (err && err.errorFields) return;

      // Map server validation errors to form fields when possible
      const serverErr = err?.response?.data;
      if (serverErr?.errors && typeof serverErr.errors === 'object') {
        const fields = Object.keys(serverErr.errors).map((key) => ({ name: key, errors: Array.isArray(serverErr.errors[key]) ? serverErr.errors[key] : [String(serverErr.errors[key])]}));
        form.setFields(fields as any);
        return;
      }

      if (serverErr?.message) {
        message.error(serverErr.message);
        return;
      }

      // Fallback
      message.error('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  // Lấy giá trị realtime cho preview
  const formValues = Form.useWatch([], form) || {};
  const pricePerStudent = Number(formValues.pricePerStudent) || 0;
  const capacity = Number(formValues.capacity) || 0;
  const estimatedRevenue = pricePerStudent * capacity;

  return (
    <Modal
      open={visible}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-md animate-pulse/30">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-lg">Chỉnh sửa lớp học</div>
            <div className="text-xs text-gray-500">Cập nhật thông tin lớp, thay đổi sẽ chuyển trạng thái Cancelled → Draft nếu cần</div>
          </div>
        </div>
      }
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting || loading}
      okText="Cập nhật"
      cancelText="Hủy"
      destroyOnClose
      width={1000}
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* FORM CỘT TRÁI */}
        <div className="flex-1 min-w-0">
          <Form form={form} layout="vertical" initialValues={initialValues}>
            <Form.Item name="title" label="Tên lớp" rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}>
              <Input size="large" className="rounded-xl h-12" placeholder="Tên lớp học" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
              <Input.TextArea rows={4} className="rounded-xl" placeholder="Mô tả ngắn về lớp" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="startDateTime" label="Ngày bắt đầu" rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}>
                <DatePicker showTime format="DD/MM/YYYY HH:mm" className="w-full rounded-xl h-12" />
              </Form.Item>

              <Form.Item name="endDateTime" label="Ngày kết thúc" rules={[{ required: true, message: 'Chọn ngày kết thúc' }]}>
                <DatePicker showTime format="DD/MM/YYYY HH:mm" className="w-full rounded-xl h-12" />
              </Form.Item>

              <Form.Item name="minStudents" label="Tối thiểu" rules={[{ required: true, type: 'number', min: 1 }]}>
                <InputNumber min={1} size="large" className="w-full rounded-xl" placeholder="VD: 5" />
              </Form.Item>

              <Form.Item name="capacity" label="Tối đa" rules={[{ required: true, type: 'number', min: 1 }]}>
                <InputNumber min={1} size="large" className="w-full rounded-xl" placeholder="VD: 30" />
              </Form.Item>

              <Form.Item name="pricePerStudent" label="Học phí" rules={[{ required: true, type: 'number', min: 0 }]}>
                <InputNumber<number>
                  min={0}
                  step={10000}
                  size="large"
                  className="w-full rounded-xl"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number((value || '').toString().replace(/[.,]/g, ''))}
                  placeholder="VD: 100000"
                  addonAfter="VNĐ"
                />
              </Form.Item>

              <Form.Item name="durationMinutes" label="Thời lượng (phút)" rules={[{ required: true, type: 'number', min: 1 }]}>
                <InputNumber min={1} size="large" className="w-full rounded-xl" placeholder="VD: 60" />
              </Form.Item>

              <Form.Item name="googleMeetLink" label="Google Meet Link">
                <Input size="large" className="rounded-xl" placeholder="https://..." />
              </Form.Item>
            </div>
          </Form>
        </div>

        {/* PREVIEW CỘT PHẢI */}
        <div className="w-full md:w-[380px] flex-shrink-0">
          <div className="sticky top-4">
            <Card className="rounded-2xl shadow-xl border-0 mb-4 transform transition-transform duration-200 hover:scale-[1.01]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-400">Preview lớp học</div>
                  <div className="text-lg font-bold text-violet-700">{formValues.title || 'Tên lớp học...'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Dự toán</div>
                  <div className="text-2xl font-extrabold text-emerald-600">{new Intl.NumberFormat('vi-VN').format(estimatedRevenue)} VNĐ</div>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">Mô tả</div>
                <div className="text-gray-700 text-sm line-clamp-3">{formValues.description || 'Mô tả ngắn sẽ hiển thị ở đây.'}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-3">
                <div>
                  <div className="text-xs text-gray-400">Ngày</div>
                  <div className="font-medium">{formValues.startDateTime ? (typeof formValues.startDateTime === 'string' ? formValues.startDateTime : formValues.startDateTime.format('DD/MM/YYYY')) : '--/--/----'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Giờ</div>
                  <div className="font-medium">{formValues.startDateTime ? (typeof formValues.startDateTime === 'string' ? formValues.startDateTime : formValues.startDateTime.format('HH:mm')) : '--:--'}</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-xs text-gray-400">Số lượng</div>
                <div className="font-medium">{formValues.minStudents || 0} - {formValues.capacity || 0} học viên</div>
              </div>

              <div className="mb-2">
                <div className="text-xs text-gray-400">Học phí</div>
                <div className="font-bold text-emerald-600">{formValues.pricePerStudent ? `${Number(formValues.pricePerStudent).toLocaleString('vi-VN')} VNĐ` : '-- VNĐ'}</div>
              </div>

            </Card>

            <Card className="rounded-2xl p-4 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-violet-100">
              <div className="text-sm text-violet-900 font-bold mb-2">Lưu ý</div>
              <div className="text-sm text-violet-700">Khi cập nhật lớp ở trạng thái <strong>Đã hủy</strong>, lớp sẽ quay về <strong>Bản nháp</strong>. Xuất bản từ trang chi tiết lớp.</div>
            </Card>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditClassModal;
