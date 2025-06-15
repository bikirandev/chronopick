import React from "react";

export type TInputChangeEvent = React.ChangeEvent<HTMLInputElement>;

export type TTextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;

export type TMouseEvent = React.MouseEvent<HTMLButtonElement>;

export type TFormEvent = React.FormEvent<HTMLFormElement>;

export type TKeyboardEvent = React.KeyboardEvent<HTMLInputElement>;

export type TFocusEvent = React.FocusEvent<HTMLInputElement>;

export type TDragEvent = React.DragEvent<HTMLDivElement>;

export type TState<T> = React.Dispatch<React.SetStateAction<T>>;
