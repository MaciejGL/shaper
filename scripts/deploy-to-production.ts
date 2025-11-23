import { execSync } from 'child_process'
import * as readline from 'readline'

const stagingBranch = process.argv[2] || 'staging'
const mainBranch = process.argv[3] || 'main'

const execCommand = (command: string, allowFailure = false): string => {
  try {
    return execSync(command, { stdio: 'pipe', encoding: 'utf-8' })
  } catch (err) {
    if (!allowFailure) {
      console.error(`Error executing command: ${command}`)
      throw err
    }
    throw err
  }
}

const askConfirmation = (question: string): Promise<boolean> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase() === 'y')
    })
  })
}

const fetchBranchesAndShowDiff = () => {
  console.log(
    `Fetching latest from origin/${stagingBranch} and origin/${mainBranch}...`,
  )
  execCommand('git fetch origin')

  console.log(`\nDifferences between ${mainBranch} and ${stagingBranch}:\n`)
  const commitDiff = execCommand(
    `git log origin/${mainBranch}..origin/${stagingBranch} --pretty=format:"• %s – %an"`,
  )
  console.log(commitDiff || 'No differences.')
}

const attemptMerge = async () => {
  try {
    execCommand(`git merge --ff-only origin/${stagingBranch}`, true)
    console.log('Fast-forward merge successful.')
  } catch {
    const confirm = await askConfirmation(
      `Non-fast-forward merge required. Do you want to proceed with a regular merge of origin/${stagingBranch} into ${mainBranch}?`,
    )
    if (!confirm) {
      console.log('Merge aborted.')
      throw new Error('Merge aborted by user')
    }
    execCommand(`git merge origin/${stagingBranch}`)
    console.log('Merge completed.')
  }
}

const hasLocalChanges = (): boolean => {
  const status = execCommand('git status --porcelain')
  return !!status.trim()
}

const stashLocalChanges = async (): Promise<boolean> => {
  if (hasLocalChanges()) {
    const confirm = await askConfirmation(
      'You have uncommitted changes. Do you want to stash them before proceeding?',
    )
    if (confirm) {
      execCommand('git stash push -u')
      console.log('Changes have been stashed.')
      return true
    } else {
      console.log('Deployment aborted due to uncommitted changes.')
      throw new Error('Uncommitted changes')
    }
  }
  return false
}

const restoreStashedChanges = () => {
  console.log('Restoring stashed changes...')
  execCommand('git stash pop')
}

const deployToProduction = async () => {
  const originalBranch = execCommand('git branch --show-current').trim()
  let hadLocalChanges = false

  try {
    hadLocalChanges = await stashLocalChanges()

    fetchBranchesAndShowDiff()

    const proceed = await askConfirmation(
      `\nDo you want to proceed with merging ${stagingBranch} into ${mainBranch}?`,
    )
    if (!proceed) {
      console.log('Deployment aborted.')
      return
    }

    execCommand(`git checkout ${mainBranch}`)

    execCommand(`git reset --hard origin/${mainBranch}`)

    await attemptMerge()

    console.log(`Pushing ${mainBranch} to origin...`)
    execCommand(`git push origin ${mainBranch}`)

    console.log('Deployment to production completed successfully.')
  } catch (err) {
    console.error('\nDeployment failed. Cleaning up...')
  } finally {
    if (originalBranch !== mainBranch) {
      console.log(`Switching back to original branch: ${originalBranch}...`)
      try {
        execCommand(`git checkout ${originalBranch}`)
      } catch {
        console.error(
          `Failed to switch back to ${originalBranch}. Please switch manually.`,
        )
      }
    }

    if (hadLocalChanges) {
      try {
        restoreStashedChanges()
      } catch {
        console.error(
          'Failed to restore stashed changes. Run "git stash pop" manually.',
        )
      }
    }
  }
}

deployToProduction()
