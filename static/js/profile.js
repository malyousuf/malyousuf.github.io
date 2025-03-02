const API_URL = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';
const profileContainer = document.getElementById('profile-container');
const profileData = document.getElementById('profile-data');
document.getElementById('logout-button').addEventListener('click', () => {
    sessionStorage.removeItem('token');
    window.location.href = 'index.html';
});

async function fetchProfileData() {
    try {
        document.getElementById('loading-spinner').style.display = 'block';
        document.getElementById('profile-container').style.display = 'none';

        const token = sessionStorage.getItem('token');
        const query = `
            query {
                user {
                    login
                    id
                    attrs
                    auditRatio
                    totalUp
                    totalDown
                    transactions(where: {type: {_eq: "xp"}}) {
                        amount
                        createdAt
                        path
                    }
                    progresses {
                        grade
                        path
                        createdAt
                    }
                    results {
                        grade
                        object {
                            name
                            type
                        }
                    }
                }
            }
        `;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        console.log(data);
        console.log(data.data.user[0].id);

        await Promise.all([
            displayProfileData(data.data.user[0]),
            displayAuditRatio(data.data.user[0]),
            fetchStudentLevel(data.data.user[0]),
            fetchStudentSkills(data.data.user[0]),
            fetchTotalXP(data.data.user[0].id)
        ]);

        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('profile-container').style.display = 'block';
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}async function fetchStudentLevel(user) {
    try {
        const token = sessionStorage.getItem('token');
        const query = `
            query {
                event_user(where: { userId: { _eq: ${user.id} }, eventId: { _eq: 20 } }) {
                    level
                }
            }
        `;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        const level = data.data.event_user[0].level;
        document.getElementById('levelPrint').textContent = `${level}`;
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}
  function displayProfileData(user) {
      profileData.innerHTML = `
          <center>
          <h2>Welcome, ${user.attrs["firstName"]} ${user.attrs["lastName"]}!</h2>
          </center>
          <div class="stat-box info-box">
              <h3>Student Information</h3>
              <p><strong>Username:</strong> ${user.login}</p>
              <p><strong>Email:</strong> ${user.attrs["email"]}</p>
          </div>
      `;
      
  }
 function displayAuditRatio(user) {
      const ratio = user.auditRatio.toFixed(1);
      const done = (user.totalUp / 1000000).toFixed(2) || 0;
      const received = (user.totalDown / 1000000).toFixed(2) || 0;
    
      const maxValue = Math.max(done, received);
      const barWidth = 200;
      const barHeight = 20;
    
      const auditSection = `
              <div class="audit-box">
                  <div class="audit-item">
                      <span class="audit-label">Audits Ratio:</span>
                      <span class="audit-value">${ratio}</span>
                  </div>
                  <div class="audit-item">
                      <svg width="${barWidth + 20}" height="${barHeight}">
                          <rect 
                              x="0" 
                              y="0" 
                              width="${(done / maxValue) * barWidth}" 
                              height="${barHeight}" 
                              fill="#32CD32"
                          />
                      </svg>
                      <span class="audit-label">Done:</span>
                      <span class="audit-value">${done} MB</span>
                  </div>
                  <div class="audit-item">
                      <svg width="${barWidth + 20}" height="${barHeight}">
                          <rect 
                              x="0" 
                              y="0" 
                              width="${(received / maxValue) * barWidth}" 
                              height="${barHeight}" 
                              fill="#FF4500"
                          />
                      </svg>
                      <span class="audit-label">Received:</span>
                      <span class="audit-value">${received} MB</span>
                  </div>
              </div>
      `;
    
      document.querySelector('#stat-wrapper').insertAdjacentHTML('beforeend', auditSection);
  }window.addEventListener('load', () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    } else {
        fetchProfileData();
    }
});

async function fetchStudentSkills(user) {
    try {
        const token = sessionStorage.getItem('token');
        const query = `
            query {
                user(where: { id: { _eq: ${user.id} } }) {
                    transactions(
                        where: { 
                            type: { _in: ["skill_js", "skill_go", "skill_html", "skill_prog", "skill_front-end", "skill_back-end"] }
                        }
                        order_by: [{ type: desc }, { amount: desc }]
                        distinct_on: [type]
                    ) {
                        type
                        amount
                        createdAt
                    }
                }
            }
        `;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        displaySkills(data.data.user[0].transactions);
    } catch (error) {
        console.error('Error fetching skills:', error);
    }
}

function displaySkills(skills) {
    const svgHeight = 400;
    const svgWidth = 400;
    const barWidth = 40;
    const maxSkill = Math.max(...skills.map(skill => skill.amount));
    
    // Color palette for different skills
    const skillColors = {
        'js': '#F0DB4F',       // JavaScript yellow
        'go': '#00ADD8',       // Go blue
        'html': '#E34C26',     // HTML orange
        'prog': '#563D7C',     // Programming purple
        'front-end': '#61DAFB', // Front-end cyan
        'back-end': '#3C873A'   // Back-end green
    };

    const skillsSection = `
        <div class="stat-box">
            <h3>Skills</h3>
            <svg width="${svgWidth}" height="${svgHeight}">
                ${skills.map((skill, index) => {
                    const barHeight = (skill.amount / maxSkill) * (svgHeight - 60);
                    const xPosition = 24 + (index * (barWidth + 20));
                    const yPosition = svgHeight - 30;
                    const skillType = skill.type.replace('skill_', '');
                    
                    // Custom x positions for specific skill types
                    const textX = skillType === 'front-end' ? '20' : 
                                 skillType === 'back-end' ? '32' : 
                                 `${barWidth/2}`;

                    return `
                        <g transform="translate(${xPosition}, ${yPosition})">
                            <rect 
                                x="0" 
                                y="-${barHeight}"
                                width="${barWidth}"
                                height="${barHeight}"
                                fill="${skillColors[skillType]}"
                            />
                            <text 
                                x="${textX}"
                                y="20"
                                text-anchor="middle"
                                transform="rotate(0, 0, 20)"
                            >${skillType}</text>
                            <text
                                x="${barWidth/2}"
                                y="-${barHeight + 20}"
                                text-anchor="middle"
                            >${skill.amount}%</text>
                        </g>
                    `;
                }).join('')}
            </svg>
        </div>
    `;
    
    document.querySelector('#skills-container').innerHTML = skillsSection;

}// Add this line in fetchProfileData() after other fetch calls
fetchStudentSkills(data.data.user[0]);

async function fetchTotalXP(userId) {
    const token = sessionStorage.getItem('token');
    const query = `
        query {
            user(where: { id: { _eq: ${userId} } }) {
                transactions_aggregate(where: { type: { _eq: "xp" }, eventId: { _eq: 20 } }) {
                    aggregate {
                        sum {
                            amount
                        }
                    }
                }
            }
        }
    `;

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
    });

    const data = await response.json();
    const totalXP = data.data.user[0].transactions_aggregate.aggregate.sum.amount;
    
    // Add this to displayProfileData function
    const xpInKB = Math.round(totalXP / 1000);
    profileData.innerHTML += `
        <div class="stat-box xp-box">
            <h3>Total XP</h3>
            <p class="xp-value">${xpInKB} KB</p>
        </div>
    `;
}
