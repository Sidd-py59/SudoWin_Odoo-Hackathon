import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterDropdownProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ label: string; value: string }>;
};

export function FilterDropdown({
  value,
  onValueChange,
  placeholder,
  options,
}: FilterDropdownProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="min-w-[170px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
