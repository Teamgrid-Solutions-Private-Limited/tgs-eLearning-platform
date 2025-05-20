import { useState } from 'react';

const CourseAnalytics = () => {
  const [courseData, setCourseData] = useState({
    title: 'Introduction to Programming',
    engagement: [
      { mark: 1, value: 15 },
      { mark: 2, value: 45 },
      { mark: 3, value: 38 },
      { mark: 4, value: 65 },
      { mark: 5, value: 40 }
    ],
    averageScore: 85,
    completionRate: 78,
    recentActivity: [
      { user: 'User 4', action: 'completed', item: 'Module 1 Quiz', date: 'April 23' },
      { user: 'User 3', action: 'completed', item: 'Introduction Video', date: 'April 23' },
      { user: 'User 8', action: 'completed', item: 'Assignment 2', date: 'April 25' },
      { user: 'User 6', action: 'completed', item: 'Final Project', date: 'April 21' },
      { user: 'User 5', action: 'completed', item: 'Module 3 Quiz', date: 'April 19' }
    ]
  });
  const [selectedCourse, setSelectedCourse] = useState('introduction-to-programming');
  const [timeRange, setTimeRange] = useState('week');

  // Function to get points for SVG path
  const getGraphPoints = () => {
    const maxValue = Math.max(...courseData.engagement.map(point => point.value));
    const width = 600;
    const height = 120;
    const padding = 30;
    
    // Calculate points
    const points = courseData.engagement.map((point, index) => {
      const x = padding + (index * ((width - (padding * 2)) / (courseData.engagement.length - 1)));
      const y = height - padding - ((point.value / maxValue) * (height - (padding * 2)));
      return [x, y];
    });
    
    // Create SVG path
    let path = `M${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      path += ` C${points[i-1][0] + 20},${points[i-1][1]} ${x - 20},${y} ${x},${y}`;
    }
    
    return path;
  };

  const getAreaPath = () => {
    const maxValue = Math.max(...courseData.engagement.map(point => point.value));
    const width = 600;
    const height = 120;
    const padding = 30;
    
    // Calculate points
    const points = courseData.engagement.map((point, index) => {
      const x = padding + (index * ((width - (padding * 2)) / (courseData.engagement.length - 1)));
      const y = height - padding - ((point.value / maxValue) * (height - (padding * 2)));
      return [x, y];
    });
    
    // Create SVG path
    let path = `M${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      path += ` C${points[i-1][0] + 20},${points[i-1][1]} ${x - 20},${y} ${x},${y}`;
    }
    
    // Add the area fill
    path += ` L${points[points.length-1][0]},${height - padding}`;
    path += ` L${points[0][0]},${height - padding}`;
    path += ` Z`;
    
    return path;
  };

  const getRandomData = (range) => {
    setTimeRange(range);
    
    // Simulate different data for different time ranges
    const newData = {
      ...courseData,
      engagement: courseData.engagement.map(point => ({
        ...point,
        value: Math.floor(Math.random() * 80) + 10
      }))
    };
    
    setCourseData(newData);
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div className="header-title">
          <h1>Course Analytics</h1>
          <p className="header-subtitle">Track course performance and engagement metrics</p>
        </div>
        
        <div className="header-controls">
          <div className="course-selector">
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="course-select"
            >
              <option value="introduction-to-programming">Introduction to Programming</option>
              <option value="advanced-javascript">Advanced JavaScript</option>
              <option value="responsive-design">Responsive Design</option>
              <option value="creating-assessments">Creating Assessments</option>
            </select>
          </div>
          
          <div className="time-range-controls">
            <button 
              className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => getRandomData('week')}
            >
              Week
            </button>
            <button 
              className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => getRandomData('month')}
            >
              Month
            </button>
            <button 
              className={`range-btn ${timeRange === 'year' ? 'active' : ''}`}
              onClick={() => getRandomData('year')}
            >
              Year
            </button>
          </div>
        </div>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-card engagement-card">
          <div className="card-header">
            <h2>Learner Engagement</h2>
            <div className="card-actions">
              <button className="card-action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="card-action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12H5M5.00006 19L19 19M12 19V21M5.00006 5L19 5M19 12H21M19 5V9M19 19V15M12 3V5M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="engagement-graph">
            <svg viewBox="0 0 600 120" width="100%" height="120">
              {/* Background grid lines */}
              <line x1="30" y1="90" x2="570" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="60" x2="570" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="30" x2="570" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              
              {/* Area under the curve */}
              <path 
                d={getAreaPath()} 
                fill="url(#engagementGradient)" 
                opacity="0.2"
              />
              
              {/* The curve line */}
              <path 
                d={getGraphPoints()} 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="2"
                strokeLinecap="round"
              />
              
              {/* Data points */}
              {courseData.engagement.map((point, index) => {
                const maxValue = Math.max(...courseData.engagement.map(point => point.value));
                const x = 30 + (index * ((600 - 60) / (courseData.engagement.length - 1)));
                const y = 120 - 30 - ((point.value / maxValue) * (120 - 60));
                
                return (
                  <g key={index}>
                    <circle 
                      cx={x}
                      cy={y}
                      r="4"
                      fill="white"
                      stroke="var(--primary)"
                      strokeWidth="2"
                    />
                    <circle 
                      cx={x}
                      cy={y}
                      r="2"
                      fill="var(--primary)"
                    />
                  </g>
                );
              })}
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="engagementGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="graph-labels">
              {courseData.engagement.map((point, index) => (
                <div key={index} className="mark-label">Module {point.mark}</div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="analytics-card metrics-card">
          <div className="card-header">
            <h2>Performance Overview</h2>
            <div className="card-date">Last updated: Today</div>
          </div>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <h3>Average Score</h3>
              </div>
              
              <div className="metric-content">
                <div className="score-circle">
                  <svg viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="3"
                      strokeDasharray={`${courseData.averageScore}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="score-text">{courseData.averageScore}</div>
                </div>
                <div className="metric-label">Points</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-header">
                <h3>Completion Rate</h3>
              </div>
              
              <div className="metric-content">
                <div className="completion-rate">
                  <span className="rate-number">{courseData.completionRate}%</span>
                  <span className="rate-trend positive">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    12%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${courseData.completionRate}%`}}
                  ></div>
                </div>
                <div className="metric-label">Students who completed the course</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="analytics-card activity-card">
          <div className="card-header">
            <h2>Recent Activity</h2>
            <button className="view-all-btn">
              View all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="activity-list">
            {courseData.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-avatar">
                  {activity.user.charAt(activity.user.length - 1)}
                </div>
                <div className="activity-details">
                  <div className="activity-text">
                    <span className="activity-user">{activity.user}</span> {activity.action} <span className="activity-item-name">{activity.item}</span>
                  </div>
                  <div className="activity-date">{activity.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="analytics-card insights-card">
          <div className="card-header">
            <h2>Key Insights</h2>
          </div>
          
          <div className="insights-list">
            <div className="insight-item">
              <div className="insight-icon positive">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 13V17M16 11V17M12 7V17M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="insight-content">
                <h3>Engagement Trend</h3>
                <p>Student engagement increased by 23% in Module 4 compared to the previous modules.</p>
              </div>
            </div>
            
            <div className="insight-item">
              <div className="insight-icon warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17.01L12.01 16.999M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="insight-content">
                <h3>Drop-off Point</h3>
                <p>45% of students did not complete Module 3's final quiz. Consider reviewing the difficulty level.</p>
              </div>
            </div>
            
            <div className="insight-item">
              <div className="insight-icon neutral">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.5 14.5L11.5 16.5L14.5 12.5M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="insight-content">
                <h3>Completion Strategy</h3>
                <p>Students who watched the introduction video were 72% more likely to complete the course.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .analytics-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .header-title h1 {
          font-size: 24px;
          font-weight: var(--font-semibold);
          margin: 0 0 8px 0;
          color: var(--dark);
        }
        
        .header-subtitle {
          font-size: 14px;
          color: var(--text);
          margin: 0;
        }
        
        .header-controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        
        .course-selector {
          position: relative;
        }
        
        .course-select {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid var(--border);
          font-size: 14px;
          min-width: 220px;
          color: var(--dark);
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 16px;
        }
        
        .time-range-controls {
          display: flex;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .range-btn {
          padding: 8px 16px;
          font-size: 14px;
          background: var(--white);
          border: none;
          color: var(--text);
          cursor: pointer;
          position: relative;
        }
        
        .range-btn:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 25%;
          height: 50%;
          width: 1px;
          background-color: var(--border);
        }
        
        .range-btn.active {
          background-color: var(--primary);
          color: white;
        }
        
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        
        .analytics-card {
          background: var(--white);
          border-radius: 12px;
          box-shadow: var(--card-shadow);
          padding: 24px;
        }
        
        .engagement-card {
          grid-column: span 2;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .card-header h2 {
          font-size: 18px;
          font-weight: var(--font-semibold);
          margin: 0;
          color: var(--dark);
        }
        
        .card-date {
          font-size: 14px;
          color: var(--text-light);
        }
        
        .card-actions {
          display: flex;
          gap: 8px;
        }
        
        .card-action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--white);
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .card-action-btn:hover {
          background: var(--secondary);
          color: var(--primary);
        }
        
        .engagement-graph {
          position: relative;
          margin-bottom: 16px;
        }
        
        .graph-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-light);
          margin-top: 12px;
          padding: 0 30px;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .metric-card {
          padding: 16px;
          border-radius: 8px;
          background-color: var(--secondary);
        }
        
        .metric-header h3 {
          font-size: 14px;
          font-weight: var(--font-medium);
          margin: 0 0 16px 0;
          color: var(--dark);
          text-align: center;
        }
        
        .metric-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .score-circle {
          position: relative;
          width: 100px;
          height: 100px;
          margin-bottom: 16px;
        }
        
        .score-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 28px;
          font-weight: var(--font-bold);
          color: var(--dark);
        }
        
        .metric-label {
          font-size: 12px;
          color: var(--text);
          margin-top: 8px;
        }
        
        .completion-rate {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 16px;
        }
        
        .rate-number {
          font-size: 28px;
          font-weight: var(--font-bold);
          color: var(--dark);
        }
        
        .rate-trend {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 14px;
          font-weight: var(--font-medium);
        }
        
        .rate-trend.positive {
          color: var(--success);
        }
        
        .rate-trend.negative {
          color: var(--error);
        }
        
        .progress-bar {
          width: 100%;
          height: 6px;
          background-color: var(--border);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        
        .progress-fill {
          height: 100%;
          background-color: var(--primary);
          border-radius: 3px;
        }
        
        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--primary);
          font-size: 14px;
          cursor: pointer;
        }
        
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .activity-avatar {
          width: 36px;
          height: 36px;
          background-color: var(--secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: var(--font-medium);
          color: var(--primary);
        }
        
        .activity-details {
          flex: 1;
        }
        
        .activity-text {
          font-size: 14px;
          color: var(--text);
        }
        
        .activity-user {
          font-weight: var(--font-medium);
          color: var(--dark);
        }
        
        .activity-item-name {
          font-weight: var(--font-medium);
        }
        
        .activity-date {
          font-size: 12px;
          color: var(--text-light);
          margin-top: 4px;
        }
        
        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .insight-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background-color: var(--secondary);
          border-radius: 8px;
        }
        
        .insight-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .insight-icon.positive {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--success);
        }
        
        .insight-icon.warning {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--warning);
        }
        
        .insight-icon.neutral {
          background-color: rgba(79, 70, 229, 0.1);
          color: var(--primary);
        }
        
        .insight-content {
          flex: 1;
        }
        
        .insight-content h3 {
          font-size: 14px;
          font-weight: var(--font-medium);
          margin: 0 0 8px 0;
          color: var(--dark);
        }
        
        .insight-content p {
          font-size: 14px;
          color: var(--text);
          margin: 0;
          line-height: 1.5;
        }
        
        @media (max-width: 992px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
          
          .engagement-card {
            grid-column: span 1;
          }
          
          .header-controls {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        
        @media (max-width: 576px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .analytics-header {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseAnalytics; 