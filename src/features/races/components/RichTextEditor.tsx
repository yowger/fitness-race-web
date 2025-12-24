"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Strike from "@tiptap/extension-strike"
import CodeBlock from "@tiptap/extension-code-block"
import Link from "@tiptap/extension-link"
import Heading, { type Level } from "@tiptap/extension-heading"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import ListKeymap from "@tiptap/extension-list-keymap"
import { Button } from "../../../components/ui/button"
import { useEffect } from "react"
import { CheckSquare, List, ListOrdered } from "lucide-react"
import { cn } from "../../../lib/utils"

interface RichTextEditorProps {
    value?: string
    onChange?: (html: string) => void
}

export function RichTextEditor({ value = "", onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Strike,
            CodeBlock,
            Link,
            Heading.configure({
                levels: [1, 2, 3],
            }),
            BulletList.configure({
                HTMLAttributes: {
                    class: "list-disc ml-4",
                },
            }),
            OrderedList.configure({
                HTMLAttributes: {
                    class: "list-decimal ml-4",
                },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            ListKeymap,
        ],
        content: value,
        onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
        editorProps: {
            attributes: {
                class: cn(
                    "prose max-w-none [&_ol]:list-decimal [&_ul]:list-disc"
                ),
            },
        },
    })

    const toggleBulletList = () =>
        editor.chain().focus().toggleBulletList().run()
    const toggleOrderedList = () =>
        editor.chain().focus().toggleOrderedList().run()
    const toggleTaskList = () => editor.chain().focus().toggleTaskList().run()
    const toggleHeading = (level: Level) => {
        editor.chain().focus().toggleHeading({ level }).run()
    }

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    if (!editor) return null

    return (
        <>
            <div
            // className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl"
            >
                <EditorContent
                    editor={editor}
                    className="rich-text-editor border rounded p-2 prose prose-sm sm:prose lg:prose-lg xl:prose-xl"
                />
            </div>

            <div className="flex flex-wrap gap-1 mt-2 p-1 bg-white">
                {/* Headings */}
                <Button
                    type="button"
                    onClick={() => toggleHeading(1)}
                    className={
                        editor.isActive("heading", { level: 1 })
                            ? "is-active"
                            : ""
                    }
                    variant={
                        editor.isActive("codeBlock") ? "default" : "outline"
                    }
                    size="sm"
                >
                    H1
                </Button>
                <Button
                    type="button"
                    onClick={() => toggleHeading(2)}
                    className={
                        editor.isActive("heading", { level: 2 })
                            ? "is-active"
                            : ""
                    }
                    variant={
                        editor.isActive("codeBlock") ? "default" : "outline"
                    }
                    size="sm"
                >
                    H2
                </Button>
                <Button
                    type="button"
                    onClick={() => toggleHeading(3)}
                    className={
                        editor.isActive("heading", { level: 3 })
                            ? "is-active"
                            : ""
                    }
                    variant={
                        editor.isActive("codeBlock") ? "default" : "outline"
                    }
                    size="sm"
                >
                    H3
                </Button>
                <Button
                    type="button"
                    onClick={() => editor.commands.setParagraph()}
                    variant={
                        editor.isActive("codeBlock") ? "default" : "outline"
                    }
                    className={editor.isActive("paragraph") ? "is-active" : ""}
                    size="sm"
                >
                    Paragraph
                </Button>

                {/* Basic formatting */}
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive("bold") ? "default" : "outline"}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    B
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive("italic") ? "default" : "outline"}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    I
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={
                        editor.isActive("underline") ? "default" : "outline"
                    }
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                >
                    U
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive("strike") ? "default" : "outline"}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    S
                </Button>

                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive("bold") ? "default" : "outline"}
                    onClick={toggleBulletList}
                >
                    <List size={16} /> {/* • List */}
                </Button>

                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive("bold") ? "default" : "outline"}
                    onClick={toggleOrderedList}
                >
                    <ListOrdered size={16} /> {/* 1. List */}
                </Button>

                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive("bold") ? "default" : "outline"}
                    onClick={toggleTaskList}
                >
                    <CheckSquare size={16} /> {/* ✅ Task list */}
                </Button>

                {/* <Button
                    type="button"
                    size="sm"
                    variant={
                        editor.isActive("blockquote") ? "default" : "outline"
                    }
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                >
                    ❝ Quote
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={
                        editor.isActive("codeBlock") ? "default" : "outline"
                    }
                    onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                    }
                >
                    {"</>"}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive("code") ? "default" : "outline"}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                >
                    `code`
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive("link") ? "default" : "outline"}
                    onClick={() => {
                        const url = prompt("Enter link URL")
                        if (url)
                            editor
                                .chain()
                                .focus()
                                .extendMarkRange("link")
                                .setLink({ href: url })
                                .run()
                    }}
                >
                    Link
                </Button> */}
            </div>
        </>
    )
}
