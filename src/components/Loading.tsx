export const Loading = () => {
  // Return null to render nothing during the transition
  // This allows the browser to show the underlying background color (body background)
  // without blocking the view with a loading indicator or opaque overlay.
  // The 'body' style in index.css handles the correct background color (bg-background).
  return null;
};
