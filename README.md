# Social Media Content Generator

A modern, intuitive web application for generating and managing social media content across multiple platforms. This tool streamlines the process of creating platform-specific content from a single input source.

## 🚀 Features

### Core Functionality
- **Multi-Platform Content Generation**: Create tailored content for LinkedIn, Twitter, Instagram, Facebook, and Blog platforms
- **Intelligent Content Processing**: Uses AI-powered workflows to generate relevant summaries and headlines
- **Image Integration**: Support for Dropbox image links with automatic loading and error handling
- **Content Preview**: Interactive preview system with expandable cards showing platform-specific content
- **Pending Posts Management**: Browse and select from previously generated content

### User Experience
- **3-Step Workflow**: Intuitive step-by-step process from input to posting
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Material Design**: Clean, modern interface with smooth animations
- **Loading States**: Visual feedback during content generation and image loading
- **Error Handling**: Comprehensive error messages and fallback states

### Technical Features
- **Real-time Data Sync**: Automatic polling for workflow completion
- **Google Sheets Integration**: Backend data storage and retrieval
- **N8N Workflow Integration**: Serverless automation for content processing
- **Cross-Origin Support**: Handles various image hosting services
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend Integration**: N8N workflows, Google Sheets API
- **Styling**: Custom CSS with Material Design principles
- **Icons**: SVG icons for crisp, scalable graphics
- **Deployment**: Static web application (no server required)

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for workflow processing
- Google account for Sheets integration (backend)
- N8N instance for workflow automation (backend)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/social-media-content-generator.git
   cd social-media-content-generator
   ```

2. **Open in browser**
   - Open `index.html` in your web browser
   - No build process or server required

3. **Start generating content**
   - Enter your content source (URL, text, or keywords)
   - Select target social media platforms
   - Choose whether to include images
   - Review and post your content

## 📖 Usage Guide

### Step 1: Content Input
- Enter a URL, keyword, or text prompt
- The system will generate relevant content and summaries

### Step 2: Platform Selection
- Choose target platforms (LinkedIn, Twitter, Instagram, Facebook, Blog)
- Optionally include images from Dropbox links
- Review generated content for each platform

### Step 3: Content Preview & Posting
- Expand cards to see full platform-specific content
- Review character counts and formatting
- Post directly to selected platforms

### Managing Pending Posts
- Click "See Pending Posts" to browse existing content
- Filter by status or select posts to continue processing
- Resume workflows for incomplete content

## 🎨 UI Components

### Navigation
- **Home Button**: Return to initial input screen
- **Progress Indicator**: Visual step tracking
- **Back/Next Buttons**: Intuitive navigation flow

### Content Cards
- **Expandable Preview**: Click anywhere on card to expand/collapse
- **Platform Icons**: Visual platform identification
- **Character Counters**: Platform-specific limits
- **Image Loading**: Spinner with error handling

### Forms & Inputs
- **Smart Validation**: Real-time input validation
- **Platform Checkboxes**: Multi-select with visual feedback
- **Image URL Input**: Dropbox link support

## 🔧 Configuration

### Backend Setup (N8N + Google Sheets)

1. **Google Sheets Setup**
   - Create a new Google Sheet
   - Set up columns: input, sourceHeadline, sourceSummary, twitterCopy, linkedinCopy, etc.
   - Make the sheet publicly accessible

2. **N8N Workflow Setup**
   - Import the provided workflow template
   - Configure Google Sheets credentials
   - Set up webhook endpoints
   - Test the content generation flow

### Customization

#### Adding New Platforms
1. Update `getPlatformIcon()` function in `script.js`
2. Add platform-specific content generation logic
3. Update character limits in `generatePlatformContent()`
4. Add platform styling in `styles.css`

#### Styling Modifications
- Colors: Update CSS custom properties
- Animations: Modify transition durations
- Layout: Adjust grid templates and spacing

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- **Desktop**: Full feature set with side-by-side layouts
- **Tablet**: Optimized spacing and touch targets
- **Mobile**: Single-column layout with collapsible navigation

## 🐛 Troubleshooting

### Common Issues

**Images not loading**
- Ensure Dropbox links are publicly accessible
- Check that URLs start with `https://`
- Verify no firewall restrictions

**Content generation fails**
- Check N8N workflow status
- Verify Google Sheets permissions
- Ensure webhook URLs are correct

**Platform checkboxes not working**
- Clear browser cache
- Check JavaScript console for errors
- Verify DOM element IDs match

### Debug Mode
Enable verbose logging by opening browser developer tools and checking the console for detailed error messages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and naming conventions
- Test on multiple browsers and devices
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **N8N**: For providing the workflow automation platform
- **Google Sheets**: For reliable data storage
- **Material Design**: For design system inspiration
- **Inter Font**: For beautiful typography

## 📞 Support

For support, please:
1. Check the troubleshooting section above
2. Review existing GitHub issues
3. Create a new issue with detailed information
4. Include browser console errors and steps to reproduce

---

**Made with ❤️ for content creators and social media managers**