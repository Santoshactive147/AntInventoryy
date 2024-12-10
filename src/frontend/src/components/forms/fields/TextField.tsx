import { TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useId, useState } from 'react';
import { FieldValues, UseControllerReturn } from 'react-hook-form';

/*
 * Custom implementation of the mantine <TextInput> component,
 * used for rendering text input fields in forms.
 * Uses a debounced value to prevent excessive re-renders.
 */
export default function TextField({
  controller,
  fieldName,
  definition,
  onChange
}: {
  controller: UseControllerReturn<FieldValues, any>;
  definition: any;
  fieldName: string;
  onChange: (value: any) => void;
}) {
  const fieldId = useId();
  const {
    field,
    fieldState: { error }
  } = controller;

  const { value } = field;

  const [rawText, setRawText] = useState(value);
  const [debouncedText] = useDebouncedValue(rawText, 250);

  useEffect(() => {
    setRawText(value);
  }, [value]);

  const onTextChange = useCallback((value: any) => {
    setRawText(value);
  }, []);

  useEffect(() => {
    if (debouncedText !== value) {
      onChange(debouncedText);
    }
  }, [debouncedText]);

  return (
    <TextInput
      {...definition}
      ref={field.ref}
      id={fieldId}
      aria-label={`text-field-${field.name}`}
      type={definition.field_type}
      value={rawText || ''}
      error={error?.message}
      radius="sm"
      onChange={(event) => onTextChange(event.currentTarget.value)}
      onBlur={(event) => {
        onChange(event.currentTarget.value);
      }}
      rightSection={
        value && !definition.required ? (
          <IconX size="1rem" color="red" onClick={() => onTextChange('')} />
        ) : null
      }
    />
  );
}
