import fs from "fs-extra"
import { join } from "path"
import semver from "semver"

module.exports = function(dot, opts) {
  if (dot.state.version) {
    return
  }

  dot.state.version = opts || {}

  dot.any("version", version)
}

async function version(prop, arg, dot) {
  const { paths } = arg,
    baseProp = prop.slice(0, -1)

  let { path } = arg

  if (!path.match(/\/package\.json$/)) {
    path = join(path, "package.json")
  }

  var pkg

  if (await fs.pathExists(path)) {
    pkg = await fs.readJson(path)
  }

  if (pkg) {
    const {
      dependencies,
      devDependencies,
      name,
      version,
    } = pkg

    await Promise.all([
      setVersions(dot, { [name]: version }),
      setVersions(dot, dependencies),
      setVersions(dot, devDependencies),
    ])
  }

  await dot.wait(baseProp, "gatherVersions", {
    count: paths.length,
  })

  if (pkg) {
    const { dependencies, devDependencies } = pkg

    for (const name in dependencies) {
      dependencies[name] = dot.get("versions", name)
    }

    for (const name in devDependencies) {
      devDependencies[name] = dot.get("versions", name)
    }

    await fs.writeJson(path, pkg, { spaces: 2 })
  }
}

async function setVersions(dot, deps = {}) {
  return Promise.all(
    Object.keys(deps).map(name => {
      return dot.set("versions", name, current => {
        let version = fixDep(deps[name])

        if (current) {
          version = semver.gt(current, version)
            ? current
            : version
        }

        return version
      })
    })
  )
}

function fixDep(dep) {
  return dep
    ? semver.coerce(dep).version + depHyphen(dep)
    : "0.0.0"
}

function depHyphen(dep) {
  return dep && dep.indexOf("-") > -1
    ? "-" + dep.split(/-/)[1]
    : ""
}
