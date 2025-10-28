# TODO: Enhance ChatPage with Detail Popup, Improved Design, and Chat History

## 1. Install Dependencies
- [x] Install Recharts library for pie chart: `npm install recharts`

## 2. AI Reply with Detail Button
- [x] Add "Xem chi tiết" button to AI message bubbles in ChatPage.jsx
- [x] Implement state for detail popup visibility (showDetail, setShowDetail)
- [x] Create DetailPopup component with summary, pie chart (using Recharts), and close button
- [x] Add smooth slide-in animation from right for popup
- [x] Add CSS styles for popup, animations, and close button in ChatPage.css

## 3. Improved Chat Design
- [x] Increase max-width of chatpage-container from 1200px to 1400px in ChatPage.css
- [x] Adjust grid-template-columns to make chat-main wider (e.g., 1fr 400px for sidebar)

## 4. Chat History on the Left Side
- [x] Modify grid-template-columns to include left panel: 300px 1fr 360px (history, chat, sidebar)
- [x] Add chat-history div in ChatPage.jsx with mock list of previous chats
- [x] Add CSS styles for chat-history panel in ChatPage.css

## 5. Testing and Verification
- [x] Run the app (`npm start`) and test the UI
- [x] Verify popup animations, pie chart display, chat scrolling, and history panel
- [x] Check responsiveness on different screen sizes
