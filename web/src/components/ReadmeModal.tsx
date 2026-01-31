import { X, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import mermaid from 'mermaid';
import { useEffect, useState, useId } from 'react';
// @ts-ignore
import readmeContent from '../../../README.md?raw';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function MermaidChart({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, ''); // unique id, remove colons for valid css selector
  const [svg, setSvg] = useState('');
  
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
    
    const renderChart = async () => {
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        setSvg(svg);
      } catch (error) {
        console.error('Mermaid render error:', error);
        setSvg('<div class="text-red-500">Error rendering chart</div>');
      }
    };
    
    renderChart();
  }, [chart, id]);

  return <div className="flex justify-center my-4" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function ReadmeModal({ isOpen, onClose }: ReadmeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-2 text-gray-800">
            <FileText className="text-blue-600" />
            <h2 className="text-lg font-bold">项目文档 (README)</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <article className="prose prose-slate prose-sm sm:prose-base max-w-none 
            prose-headings:font-bold prose-headings:text-gray-800 prose-h1:text-2xl prose-h2:text-xl
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-pre:bg-gray-800 prose-pre:text-gray-50
            prose-code:text-pink-600 prose-code:bg-gray-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
            prose-img:rounded-lg prose-img:shadow-md
            
            /* Fix for centered badges/images in README */
            [&_div[align='center']]:text-center 
            [&_div[align='center']_img]:inline-block 
            [&_div[align='center']_img]:mx-1 
            [&_div[align='center']_img]:my-0
            [&_div[align='center']_p]:my-2
          ">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSlug]}
              components={{
                img: ({node, src, ...props}) => {
                  // Fix image paths: replace 'web/public/' with '/' to make them work in the app
                  // GitHub README uses paths relative to repo root (web/public/...),
                  // but in the app, 'public' folder contents are served at root.
                  const finalSrc = src?.startsWith('web/public/') 
                    ? src.replace('web/public/', '/') 
                    : src;
                  return <img src={finalSrc} {...props} />;
                },
                code: ({node, className, children, ...props}) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isMermaid = match && match[1] === 'mermaid';
                  
                  if (isMermaid) {
                    return <MermaidChart chart={String(children).replace(/\n$/, '')} />;
                  }
                  
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {readmeContent}
            </ReactMarkdown>
          </article>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
