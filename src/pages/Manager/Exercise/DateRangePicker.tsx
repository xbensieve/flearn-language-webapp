import { DatePicker, ConfigProvider } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import enUS from "antd/locale/en_US";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function AntdDateRangePicker({ dateRange, setDateRange }: any) {
  const handleChange: RangePickerProps["onChange"] = (values) => {
    setDateRange({
      from: values?.[0] ? values[0].toDate() : null,
      to: values?.[1] ? values[1].toDate() : null,
    });
  };

  return (
    <ConfigProvider
      locale={enUS}
      theme={{
        token: {
          colorPrimary: "#1677ff", // màu chính (blue đẹp)
          colorPrimaryHover: "#3c8cff",
          colorPrimaryActive: "#0e63d7",
          borderRadius: 8,
        },
        components: {
          DatePicker: {
            controlOutline: "rgba(22,119,255,0.3)", // bỏ viền đen khi focus
            cellActiveWithRangeBg: "#e6f4ff", // bỏ màu đen khi chọn
            cellHoverBg: "#e6f4ff",
          },
        },
      }}
    >
      <RangePicker
        value={[
          dateRange.from ? dayjs(dateRange.from) : null,
          dateRange.to ? dayjs(dateRange.to) : null,
        ]}
        placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
        onChange={handleChange}
        format="DD/MM/YYYY"
        allowClear
        className="w-full sm:w-[300px]"
      />
    </ConfigProvider>
  );
}
