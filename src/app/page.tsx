import styles from '@/styles/Home.module.css'

export default async function Home() {
  return (
    <main className={styles.main}>
      <div className="container">
        <h1 className={styles.title}>Fleet Management System</h1>
        
        <div className={styles.grid}>
          <a href="/vehicles" className={styles.card}>
            <h2 className={styles.cardTitle}>Vehicle Management</h2>
            <p className={styles.cardText}>
              View and manage your fleet of vehicles with real-time status updates.
            </p>
          </a>

          <a href="/projects" className={styles.card}>
            <h2 className={styles.cardTitle}>Project Management</h2>
            <p className={styles.cardText}>
              Track and manage ongoing projects and vehicle assignments efficiently.
            </p>
          </a>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Status</h2>
            <p className={styles.cardText}>
              <span className={styles.statusDot}></span>
              System Online
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
