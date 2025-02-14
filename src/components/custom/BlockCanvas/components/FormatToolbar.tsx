import React, { useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  ArrowRight,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Code,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Editor } from '@tiptap/react';

interface ToolbarProps {
  className?: string;
  editor: Editor | null;
}

type HeadingLevel = 1 | 2 | 3 | 4 | 5;
type ListType = 'bullet' | 'ordered' | 'arrow';

const HeadingIcon = ({ level }: { level: HeadingLevel }) => {
  const icons = {
    1: Heading1,
    2: Heading2,
    3: Heading3,
    4: Heading4,
    5: Heading5,
  };
  const Icon = icons[level];
  return <Icon size={16} />;
};

const ListIcon = ({ type }: { type: ListType }) => {
  switch (type) {
    case 'bullet':
      return <List size={16} />;
    case 'ordered':
      return <ListOrdered size={16} />;
    case 'arrow':
      return <ArrowRight size={16} />;
  }
};

export function Toolbar({ className, editor }: ToolbarProps) {
  const iconSize = 16;
  const [currentHeadingLevel, setCurrentHeadingLevel] = React.useState<HeadingLevel>(1);
  const [currentListType, setCurrentListType] = React.useState<ListType>('bullet');

  if (!editor) {
    return null;
  }

  // Update current heading level based on editor state
  useEffect(() => {
    const updateHeadingLevel = () => {
      for (let level = 1; level <= 5; level++) {
        if (editor.isActive('heading', { level })) {
          setCurrentHeadingLevel(level as HeadingLevel);
          break;
        }
      }
    };

    editor.on('selectionUpdate', updateHeadingLevel);
    editor.on('update', updateHeadingLevel);

    return () => {
      editor.off('selectionUpdate', updateHeadingLevel);
      editor.off('update', updateHeadingLevel);
    };
  }, [editor]);

  // Update current list type based on editor state
  useEffect(() => {
    const updateListType = () => {
      if (editor.isActive('bulletList')) {
        if (editor.isActive('bulletList', { class: 'arrow-list' })) {
          setCurrentListType('arrow');
        } else {
          setCurrentListType('bullet');
        }
      } else if (editor.isActive('orderedList')) {
        setCurrentListType('ordered');
      }
    };

    editor.on('selectionUpdate', updateListType);
    editor.on('update', updateListType);

    return () => {
      editor.off('selectionUpdate', updateListType);
      editor.off('update', updateListType);
    };
  }, [editor]);

  const toggleHeading = () => {
    const nextLevel = (currentHeadingLevel % 5 + 1) as HeadingLevel;
    setCurrentHeadingLevel(nextLevel);

    // First clear any existing heading
    for (let level = 1; level <= 5; level++) {
      editor.chain().focus().toggleHeading({ level: level as HeadingLevel }).run();
    }
    // Then apply the new heading level
    editor.chain().focus().toggleHeading({ level: nextLevel }).run();
  };

  const toggleList = () => {
    const listTypes: ListType[] = ['bullet', 'ordered', 'arrow'];
    const currentIndex = listTypes.indexOf(currentListType);
    const nextType = listTypes[(currentIndex + 1) % listTypes.length];
    setCurrentListType(nextType);

    // Clear any existing list format
    editor.chain().focus()
      .toggleBulletList()
      .toggleOrderedList()
      .run();

    // Apply the new list format
    switch (nextType) {
      case 'bullet':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'ordered':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'arrow':
        editor.chain().focus()
          .toggleBulletList()
          .updateAttributes('bulletList', { class: 'arrow-list' })
          .run();
        break;
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };
  
  return (
    <div className={cn(
      "w-full bg-background border-b border-border px-4 py-2 flex items-center gap-2 font-mono text-sm",
      className
    )}>
      {/* Format Group */}
      <div className="flex items-center gap-1 pr-3 border-r border-border">
        <Button 
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'} 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={iconSize} />
        </Button>
        <Button 
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'} 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={iconSize} />
        </Button>
        <Button 
          variant={editor.isActive('underline') ? 'secondary' : 'ghost'} 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline size={iconSize} />
        </Button>
      </div>

      {/* Alignment Group */}
      <div className="flex items-center gap-1 px-3 border-r border-border">
        <Button 
          variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft size={iconSize} />
        </Button>
        <Button 
          variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter size={iconSize} />
        </Button>
        <Button 
          variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight size={iconSize} />
        </Button>
      </div>

      {/* Structure Group */}
      <div className="flex items-center gap-1 px-3 border-r border-border">
        <Button 
          variant={editor.isActive('heading', { level: currentHeadingLevel }) ? 'secondary' : 'ghost'} 
          size="icon" 
          className="h-8 w-8"
          onClick={toggleHeading}
          title={`Heading ${currentHeadingLevel}`}
        >
          <HeadingIcon level={currentHeadingLevel} />
        </Button>
        <Button 
          variant={
            (currentListType === 'bullet' && editor.isActive('bulletList')) ||
            (currentListType === 'ordered' && editor.isActive('orderedList')) ||
            (currentListType === 'arrow' && editor.isActive('bulletList', { class: 'arrow-list' }))
              ? 'secondary'
              : 'ghost'
          }
          size="icon" 
          className="h-8 w-8"
          onClick={toggleList}
          title={`${currentListType.charAt(0).toUpperCase() + currentListType.slice(1)} List`}
        >
          <ListIcon type={currentListType} />
        </Button>
        <Button 
          variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'} 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code size={iconSize} />
        </Button>
      </div>

      {/* Insert Group */}
      <div className="flex items-center gap-1 pl-3">
        <Button 
          variant={editor.isActive('link') ? 'secondary' : 'ghost'} 
          size="icon" 
          className="h-8 w-8"
          onClick={addLink}
        >
          <LinkIcon size={iconSize} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={addImage}
        >
          <ImageIcon size={iconSize} />
        </Button>
      </div>
    </div>
  );
}