export default function AdminPageLayout({ title, description, icon, djangoUrl, children }) {
  const list = Array.isArray(children) ? children : [children]

  return (
    <div>
      <div className="headline mb-4">
        <span className="headline-square" />
        <h1 className="headline-text">
          {icon ? `${icon} ` : ''}{title}
        </h1>
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      {list}
      {djangoUrl && (
        <div className="mt-8 pt-6 border-t border-earth-200">
          <a
            href={djangoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-primary-600"
          >
            Open in Django admin (optional)
          </a>
        </div>
      )}
    </div>
  )
}
