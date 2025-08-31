import { IModel } from '@/types/models';
import { DateEditComponent } from './edit-components/date-edit-component';
import { SelectEditComponent } from './edit-components/select-edit-component';
import { TextEditComponent } from './edit-components/text-edit-component';
import { ToggleEditComponent } from './edit-components/toggle-edit-component';
import { InlineEditComponentProps } from './types';

// Main Inline Edit Component
export function InlineEditComponent<T extends IModel>(props: InlineEditComponentProps<T>) {
    const { column } = props;

    // Select field
    if (column.editType === 'select' && column.editOptions) {
        return <SelectEditComponent {...props} />;
    }

    // Date field
    if (column.editType === 'date') {
        return <DateEditComponent {...props} />;
    }

    // Toggle field
    if (column.editType === 'toggle') {
        return <ToggleEditComponent {...props} />;
    }

    // Default to text/email/number input
    return <TextEditComponent {...props} />;
}
